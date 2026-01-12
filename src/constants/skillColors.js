// Shared hex colors for skill categories across Admin and Landing
export const skillHex = {
  Communication: '#e1b925ff',
  Leadership: '#3A86FF',
  Thinking: '#6DC5AB',
  Organizing: '#FF1B1C',
  Technical: '#481452',
  Language: '#444C43',
};

export const getChipStyle = (category) => ({
  backgroundColor: skillHex[category] || '#6B7280',
  color: '#FFFFFF',
});

export const getBorderStyle = (category, width = 4) => ({
  border: `${width}px solid ${skillHex[category] || '#FFFFFF'}`,
  borderRadius: '9999px',
});
