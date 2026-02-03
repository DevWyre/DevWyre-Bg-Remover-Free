import React from 'react';

const WhyUseSection = () => {
  return (
    <section style={{
      background: 'white',
      borderRadius: '0px',
      padding: '2rem',
      marginTop: '3rem',
      boxShadow: ' transparent, 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '600',
          color: '#0f172a',
          marginBottom: '1rem'
        }}>
          Why Use This Site?
        </h2>
        <p style={{ fontSize: '1.125rem', color: '#475569' }}>
          100% Free, Privacy-first background removal using WebGPU, all processing happens locally in your browser with full 4K resolution, and open-source transparency. See our <a href="https://github.com/DevWyre" style={{ color: 'inherit', textDecoration: 'underline' }}>GitHub repository</a>.
        </p>
      </div>


      <div>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#0f172a',
          marginBottom: '1.25rem'
        
        }}> </h3>
      </div>
    </section>
  );
};

const FeatureCard = ({ title, description, emoji }: { title: string, description: string, emoji: string }) => (
  <div style={{
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0'
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem',
      marginBottom: '1rem'
    }}>
      <span style={{ fontSize: '2rem' }}>{emoji}</span>
      <h4 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#0f172a',
        margin: 0
      }}>{title}</h4>
    </div>
    <p style={{ 
      fontSize: '1rem', 
      color: '#64748b',
      lineHeight: '1.5'
    }}>{description}</p>
  </div>
);

export default WhyUseSection;