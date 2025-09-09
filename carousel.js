// scrolling images and other functionality
document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

document.querySelectorAll('.project-carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const slides = carousel.querySelectorAll('.carousel-slide');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    function updateCarousel() {
        const slideWidth = 64; // 60% width + 4% margin
        const offset = -(currentSlide * slideWidth) + 20;

        
        track.style.transform = `translateX(${offset}%)`;
        track.setAttribute('data-current', currentSlide);
        
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            
            if(index === currentSlide){
                slide.classList.add('active');
            } else if (index === currentSlide - 1 || (currentSlide === 0 && index === totalSlides - 1)) {
                slide.classList.add('prev');
            } else if (index === currentSlide + 1 || (currentSlide === totalSlides - 1 && index === 0)) {
                slide.classList.add('next');
            }
        });
    }
    
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentSlide = currentSlide > 0 ? currentSlide - 1 : totalSlides - 1;
        updateCarousel();
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentSlide = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
        updateCarousel();
    });
    
    updateCarousel();
});

document.querySelectorAll('.project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const button = e.target;
        const card = e.target.closest('.project-card');
        const title = card.querySelector('.project-title').textContent;
        
        button.style.transform = 'scale(0.85)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
        
        if(button.classList.contains('right')){
            console.log(`Viewing project for: ${title}`);
        }else{
            console.log(`Viewing details for: ${title}`);
        }
    });
});

window.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.project-card');
    const scrolled = window.pageYOffset;
    
    cards.forEach((card, index) => {
        const rate = scrolled * -0.5;
        const yPos = -(rate / (index + 1));
        card.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card').forEach(card => {
    observer.observe(card);
});

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");
    const closeBtn = document.getElementById("closeBtn");
    const slides = document.querySelectorAll(".carousel-slide");
  
    slides.forEach(slide => {
      slide.addEventListener("click", () => {
        const bg = slide.style.backgroundImage;
        const url = bg.slice(5, -2);
        modalImg.src = url;
        modal.classList.add("show");
      });
    });
  
    closeBtn.onclick = () => modal.classList.remove("show");
    modal.onclick = e => { if (e.target === modal) modal.classList.remove("show"); };
});