<template>
  <div class="home-container">
    <div class="hero-section">
      <h1>Welcome to 3D Museum</h1>
      <p>Explore our interactive museum experience and digital twin technology</p>
      <router-link to="/digital-twin" class="cta-button">Explore Digital Twin</router-link>
    </div>
    
    <div class="features-section">
      <div class="feature-card">
        <div class="icon">🏛️</div>
        <h3>Virtual Museum</h3>
        <p>Experience our museum from anywhere in the world</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">🔍</div>
        <h3>Interactive Exhibits</h3>
        <p>Engage with exhibits through our digital platform</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">🌐</div>
        <h3>Digital Twin</h3>
        <p>Explore our building's digital representation</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Home component logic
</script>

<style scoped>
.home-container {
  padding: 2rem;
}

.hero-section {
  height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
              url('/assets/1.jpg') no-repeat center center;
  background-size: cover;
  color: white;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  max-width: 600px;
}

.cta-button {
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.cta-button:hover {
  background-color: #45a049;
}

.features-section {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

.feature-card {
  flex: 1;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
}
</style> 