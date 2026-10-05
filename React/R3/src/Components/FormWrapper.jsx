import React from 'react';
import Card from './Card.jsx';

/**
 * Contenedor estilizado para vistas y formularios de autenticación
 */
export default function FormWrapper({ title, subtitle, children, footer, maxWidth = 'max-w-md' }) {
  return (
    <div className="container py-8 sm:py-12 flex justify-center items-center min-h-[calc(100vh-140px)]">
      <div className={`w-full ${maxWidth} transition-all duration-300`}>
        <Card title={title} subtitle={subtitle} footer={footer}>
          {children}
        </Card>
      </div>
    </div>
  );
}
