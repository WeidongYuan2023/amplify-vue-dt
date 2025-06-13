<template>
  <div class="about-container">
    <div class="about-header">
      <h1>About Our Museum</h1>
    </div>
    
    <div class="about-content">
      <div class="about-section">
        <h2>Our History</h2>
        <p>Founded in 2022, our digital museum aims to bring cultural experiences to people all around the world. We leverage cutting-edge technology to create immersive digital experiences of physical exhibits and spaces.</p>
      </div>
      
      <div class="about-section">
        <h2>Digital Twin Technology</h2>
        <p>Our digital twin platform is an exact virtual replica of our physical museum space. This technology allows visitors to explore our museum remotely, interact with exhibits, and learn about our collections from anywhere in the world.</p>
        <p>The digital twin is continuously updated to reflect changes in the physical space, ensuring a true-to-life experience.</p>
      </div>
      
      <div class="about-section">
        <h2>Our Mission</h2>
        <p>We are committed to making cultural and educational experiences accessible to everyone through innovative digital solutions. By removing physical barriers, we aim to democratize access to knowledge and cultural heritage.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// About component logic
</script>

<style scoped>
.about-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
}

.about-header h1 {
  font-size: 2.5rem;
  color: #333;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.about-section {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.about-section h2 {
  color: #4CAF50;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.about-section p {
  line-height: 1.6;
  color: #555;
  margin-bottom: 1rem;
}

.about-section p:last-child {
  margin-bottom: 0;
}
</style>