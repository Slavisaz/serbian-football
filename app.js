document.querySelectorAll('.tabs a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.tabs a').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
  });
});
