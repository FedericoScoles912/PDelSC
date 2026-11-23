/**
 * ============================================================================
 *  Google Apps Script — Stocker Mailer (2 Plantillas Independientes + Keep-Alive)
 * ============================================================================
 *  1) Plantilla A (`payload.tipo === 'pedido_importador'`):
 *     Envía exclusivamente la Orden de Compra / Pedido de Reposición a la
 *     Importadora con la tabla de códigos, unidades solicitadas y el PDF adjunto.
 *  2) Plantilla B (por defecto / `recuperacion`):
 *     Envía exclusivamente el código de 6 dígitos para recuperar el inicio de sesión.
 *  3) `mantenerRenderActivo()`:
 *     Ping silencioso con `try/catch` y `muteHttpExceptions: true`.
 * ============================================================================
 */

var SECRET_ESPERADO = 'd8288088419a21d3daa903337dc0acdb1a2d1ebceb0f169e';
var URL_HEALTH_RENDER = 'https://stocker-aqs2.onrender.com/api/v1/health';

function mantenerRenderActivo() {
  try {
    var resp = UrlFetchApp.fetch(URL_HEALTH_RENDER, {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: false,
      validateHttpsCertificates: true,
      headers: {
        'User-Agent': 'Stocker-KeepAlive/1.0',
        'Accept': 'application/json'
      }
    });
    console.log('Keep-alive Render ejecutado. Código de respuesta:', resp.getResponseCode());
  } catch (e) {
    console.warn('Keep-alive Render aviso no crítico:', String(e));
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, servicio: 'Stocker Mailer v2 Activo' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = JSON.parse(raw);

    if (SECRET_ESPERADO && data.secret !== SECRET_ESPERADO) {
      return responderJson({ ok: false, error: 'No autorizado' });
    }

    var to = String(data.to || '').trim();
    if (!to) {
      return responderJson({ ok: false, error: 'Destinatario obligatorio' });
    }

    // =========================================================================
    //  MENSAJE 1: ORDEN DE COMPRA / PEDIDO DE REPOSICIÓN A IMPORTADORA (+ PDF)
    // =========================================================================
    if (data.tipo === 'pedido_importador') {
      var importador = String(data.importador || 'Importadora');
      var negocioNombre = String(data.negocioNombre || 'Stocker');
      var ordenId = String(data.ordenId || 'OC-STOCKER');
      var notas = String(data.notas || '');
      var items = Array.isArray(data.items) ? data.items : [];
      var totalUnidades = Number(data.totalUnidades || 0);
      var asuntoPedido = String(
        data.subject || ('Orden de Compra ' + ordenId + ' — ' + negocioNombre + ' para ' + importador)
      );

      var filasHtml = '';
      var lineasTexto = [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i] || {};
        var cod = String(it.codigo || '');
        var cant = Number(it.cantidad || 1);
        var det = String(it.detalle || it.categoria || 'Retén / Sello');
        filasHtml +=
          '<tr>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #E6DDD3;font-weight:bold;color:#B4533A">' + cod + '</td>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #E6DDD3;color:#5C4D43;font-size:13px">' + det + '</td>' +
          '<td style="padding:10px 12px;border-bottom:1px solid #E6DDD3;text-align:right;font-weight:bold;color:#2E241F">' + cant + ' u.</td>' +
          '</tr>';
        lineasTexto.push((i + 1) + '. Código: ' + cod + ' — Cantidad solicitada: ' + cant + ' unidades (' + det + ')');
      }

      var cuerpoTextoPedido =
        'ORDEN DE COMPRA A IMPORTADORA — ' + negocioNombre + '\n' +
        'Orden N°: ' + ordenId + '\n' +
        'Importador / Proveedor: ' + importador + '\n\n' +
        'Detalle de productos solicitados:\n' +
        lineasTexto.join('\n') + '\n\n' +
        'Total de códigos: ' + items.length + '\n' +
        'Total de unidades solicitadas: ' + totalUnidades + ' unidades\n' +
        (notas ? 'Observaciones: ' + notas + '\n' : '') +
        '\nSe adjunta el documento PDF oficial con la Orden de Compra.';

      var cuerpoHtmlPedido =
        '<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#FBF8F4;border:1px solid #E2D7CB;border-radius:14px;overflow:hidden;color:#2E241F">' +
        '<div style="background:#B4533A;color:#FFFFFF;padding:20px 24px">' +
        '<div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;opacity:0.9">Stocker · Solicitud de Reposición</div>' +
        '<h2 style="margin:6px 0 0 0;font-size:20px">Orden de Compra a Importadora (' + ordenId + ')</h2>' +
        '</div>' +
        '<div style="padding:24px">' +
        '<p style="margin-top:0">Estimados <strong>' + importador + '</strong>,</p>' +
        '<p style="color:#5C4D43;line-height:1.5">Desde <strong>' + negocioNombre + '</strong> enviamos la solicitud de reposición de stock correspondiente a los siguientes artículos (se adjunta comprobante en formato <strong>PDF</strong>):</p>' +
        '<table style="width:100%;border-collapse:collapse;margin:18px 0;background:#FFFFFF;border:1px solid #E6DDD3;border-radius:10px">' +
        '<thead><tr style="background:#5E7244;color:#FFFFFF;font-size:12px;text-transform:uppercase">' +
        '<th style="padding:10px 12px;text-align:left">Código</th>' +
        '<th style="padding:10px 12px;text-align:left">Detalle / Medidas</th>' +
        '<th style="padding:10px 12px;text-align:right">Unidades Solic.</th>' +
        '</tr></thead>' +
        '<tbody>' + filasHtml + '</tbody>' +
        '</table>' +
        '<div style="background:#F2ECE4;border-left:4px solid #B4533A;padding:12px 16px;border-radius:6px;margin-top:16px">' +
        '<strong>Total de códigos:</strong> ' + items.length + ' &nbsp;|&nbsp; ' +
        '<strong>Total de unidades solicitadas:</strong> ' + totalUnidades + ' unidades' +
        (notas ? '<div style="margin-top:6px;font-size:13px;color:#5C4D43"><strong>Observaciones:</strong> ' + notas + '</div>' : '') +
        '</div>' +
        '<p style="font-size:12px;color:#7A6A5E;margin-top:20px;margin-bottom:0">El archivo PDF adjunto contiene el detalle completo listo para procesar el pedido.</p>' +
        '</div></div>';

      var opcionesPedido = {
        htmlBody: cuerpoHtmlPedido,
        name: negocioNombre + ' — Pedidos Stocker'
      };

      if (data.pdfBase64) {
        var bytesPdf = Utilities.base64Decode(data.pdfBase64);
        var blobPdf = Utilities.newBlob(
          bytesPdf,
          'application/pdf',
          data.nombreArchivo || ('orden_compra_' + ordenId + '.pdf')
        );
        opcionesPedido.attachments = [blobPdf];
      }

      GmailApp.sendEmail(to, asuntoPedido, cuerpoTextoPedido, opcionesPedido);
      return responderJson({ ok: true, tipo: 'pedido_importador', enviado: true });
    }

    // =========================================================================
    //  MENSAJE 2: RECUPERACIÓN DE INICIO DE SESIÓN (CÓDIGO DE 6 DÍGITOS)
    // =========================================================================
    var codigo = String(data.codigo || '').trim();
    var nombre = String(data.nombre || 'Usuario').trim();
    var asuntoLogin = 'Stocker — Tu código de acceso (' + codigo + ')';
    var textoLogin =
      'Hola ' + nombre + ',\n\n' +
      'Recibimos una solicitud para ingresar a tu cuenta de Stocker.\n' +
      'Tu código de verificación de 6 dígitos es: ' + codigo + '\n\n' +
      'Este código vence en 10 minutos. Si no lo solicitaste, podés ignorar este mensaje.';

    var htmlLogin =
      '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #E5DCD2;border-radius:14px;background:#FBF8F4;color:#2E241F">' +
      '<h2 style="color:#B4533A;margin-top:0">Recuperación de Inicio de Sesión — Stocker</h2>' +
      '<p>Hola <strong>' + nombre + '</strong>,</p>' +
      '<p>Ingresá el siguiente código de 6 dígitos en la aplicación para acceder a tu cuenta:</p>' +
      '<div style="font-size:30px;font-weight:bold;letter-spacing:8px;text-align:center;padding:16px;margin:18px 0;background:#F2ECE4;border-radius:10px;color:#B4533A">' +
      codigo +
      '</div>' +
      '<p style="font-size:12px;color:#6E5F53">Este código es válido por 10 minutos. Si no solicitaste recuperar el acceso, ignorá este correo.</p>' +
      '</div>';

    GmailApp.sendEmail(to, asuntoLogin, textoLogin, {
      htmlBody: htmlLogin,
      name: 'Stocker — Seguridad de Cuenta'
    });

    return responderJson({ ok: true, tipo: 'recuperacion' });
  } catch (err) {
    return responderJson({
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function responderJson(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
