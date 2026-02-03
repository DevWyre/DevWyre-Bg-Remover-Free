
const WhyUseSection = () => {
  return (
    <section style={{
      backgroundColor: 'white',
      borderRadius: '0px',
      padding: '2rem',
      marginTop: '3rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.06)',
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
          100% Free, Privacy-first background removal using WebGPU, all processing happens locally in your browser with full 4K resolution, and open-source transparency. See our <a href="https://github.com/DevWyre/DevWyre-Bg-Remover-Free" style={{ color: 'inherit', textDecoration: 'underline' }}>GitHub repository</a>.
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


export default WhyUseSection;