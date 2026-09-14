
    
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            500: '#0284c7',
                            600: '#0284c7',
                            700: '#0369a1',
                            800: '#075985',
                            900: '#0c4a6e',
                            dark: '#0f172a'
                        },
                        cyanAccent: '#06b6d4',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    }
                }
            }
        };

        // Basic client-side deterrents for casual copying and inspection.
        // These are not a substitute for server-side access control or licensing.
        (() => {
            const isEditableTarget = target => {
                return Boolean(
                    target &&
                    typeof target.closest === 'function' &&
                    target.closest('input, textarea, select, [contenteditable="true"]')
                );
            };

            const blockNonEditableEvent = event => {
                if (!isEditableTarget(event.target)) {
                    event.preventDefault();
                }
            };

            document.oncontextmenu = blockNonEditableEvent;
            document.onselectstart = blockNonEditableEvent;
            document.oncopy = blockNonEditableEvent;
            document.oncut = blockNonEditableEvent;

            document.addEventListener('contextmenu', event => {
                blockNonEditableEvent(event);
            }, true);

            document.addEventListener('selectstart', event => {
                blockNonEditableEvent(event);
            }, true);

            document.addEventListener('dragstart', event => {
                if (event.target instanceof HTMLImageElement || !isEditableTarget(event.target)) {
                    event.preventDefault();
                }
            }, true);

            document.addEventListener('copy', event => {
                if (!isEditableTarget(event.target)) {
                    event.preventDefault();
                }
            }, true);

            document.addEventListener('cut', event => {
                if (!isEditableTarget(event.target)) {
                    event.preventDefault();
                }
            }, true);

            document.addEventListener('keydown', event => {
                const key = event.key.toLowerCase();
                const isDevToolsShortcut =
                    event.key === 'F12' ||
                    (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
                    (event.ctrlKey && ['u', 's', 'p'].includes(key));

                if (isDevToolsShortcut && !isEditableTarget(event.target)) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }, true);

            window.addEventListener('beforeprint', event => {
                event.preventDefault();
            });
        })();

        // Set current year
        document.getElementById('year').textContent = new Date().getFullYear();

        // Mobile menu toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');

        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            if (mobileMenu.classList.contains('hidden')) {
                menuIcon.classList.remove('fa-xmark');
                menuIcon.classList.add('fa-bars');
            } else {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-xmark');
            }
        });

        // Close mobile menu when clicking links
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('fa-xmark');
                menuIcon.classList.add('fa-bars');
            });
        });

        // Testimonials carousel: buttons on desktop and swipe gestures on touch devices.
        const testimonialsCarousel = document.getElementById('testimonials-carousel');
        const testimonialsTrack = testimonialsCarousel.querySelector('.testimonials-track');
        const testimonialCards = Array.from(testimonialsTrack.children);
        const previousTestimonialButton = testimonialsCarousel.querySelector('.testimonial-arrow-prev');
        const nextTestimonialButton = testimonialsCarousel.querySelector('.testimonial-arrow-next');
        let testimonialIndex = 0;
        let testimonialStartX = 0;
        let testimonialStartY = 0;

        function getTestimonialsPerPage() {
            return window.matchMedia('(max-width: 767px)').matches ? 1 : 2;
        }

        function updateTestimonialsCarousel() {
            const perPage = getTestimonialsPerPage();
            const maxIndex = Math.max(0, testimonialCards.length - perPage);
            testimonialIndex = Math.min(testimonialIndex, maxIndex);
            const cardWidth = testimonialCards[0].getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(testimonialsTrack).gap) || 0;
            testimonialsTrack.style.transform = `translateX(-${testimonialIndex * (cardWidth + gap)}px)`;
            previousTestimonialButton.disabled = testimonialIndex === 0;
            nextTestimonialButton.disabled = testimonialIndex === maxIndex;
        }

        previousTestimonialButton.addEventListener('click', () => {
            testimonialIndex -= 1;
            updateTestimonialsCarousel();
        });

        nextTestimonialButton.addEventListener('click', () => {
            testimonialIndex += 1;
            updateTestimonialsCarousel();
        });

        testimonialsCarousel.addEventListener('touchstart', event => {
            const touch = event.changedTouches[0];
            testimonialStartX = touch.clientX;
            testimonialStartY = touch.clientY;
        }, { passive: true });

        testimonialsCarousel.addEventListener('touchend', event => {
            const touch = event.changedTouches[0];
            const horizontalDistance = touch.clientX - testimonialStartX;
            const verticalDistance = touch.clientY - testimonialStartY;

            if (Math.abs(horizontalDistance) <= 40 || Math.abs(horizontalDistance) <= Math.abs(verticalDistance)) {
                return;
            }

            const maxIndex = Math.max(0, testimonialCards.length - getTestimonialsPerPage());
            testimonialIndex = Math.max(0, Math.min(maxIndex, testimonialIndex + (horizontalDistance < 0 ? 1 : -1)));
            updateTestimonialsCarousel();
        }, { passive: true });

        window.addEventListener('resize', updateTestimonialsCarousel);
        updateTestimonialsCarousel();

        // Service Modal Functions
        function openServiceModal(title, description) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-description').textContent = description;
            const waText = encodeURIComponent(`Olá! Gostaria de saber mais sobre o serviço de ${title}.`);
            document.getElementById('modal-whatsapp-link').href = `https://wa.me/5551996184755?text=${waText}`;
            document.getElementById('service-modal').classList.remove('hidden');
        }

        function closeServiceModal() {
            document.getElementById('service-modal').classList.add('hidden');
        }

        // Close modal when clicking backdrop
        document.getElementById('service-modal').addEventListener('click', (e) => {
            if (e.target.id === 'service-modal') {
                closeServiceModal();
            }
        });

        // WhatsApp Form Redirect Function
        function sendFormToWhatsApp(event, formId) {
            event.preventDefault();

            let name, phone, service, modelBtus, quantity, location, message;

            if (formId === 'hero-quote-form') {
                name = document.getElementById('hero-name').value;
                phone = document.getElementById('hero-phone').value;
                service = document.getElementById('hero-service').value;
                modelBtus = '';
                quantity = '';
                location = '';
                message = document.getElementById('hero-message').value;
            } else {
                name = document.getElementById('main-name').value;
                phone = document.getElementById('main-phone').value;
                service = document.getElementById('main-service').value;
                modelBtus = document.getElementById('main-model-btus').value;
                quantity = document.getElementById('main-quantity').value;
                location = document.getElementById('main-location').value;
                message = document.getElementById('main-message').value;
            }

            const textMessage = `*Novo Contato via Site - MR Ar Condicionado*\n\n` +
                                `*Nome:* ${name}\n` +
                                `*Telefone:* ${phone}\n` +
                                `*Serviço de Interesse:* ${service}\n` +
                                (quantity ? `*Quantidade de aparelhos:* ${quantity}\n` : '') +
                                (modelBtus ? `*Modelo / BTUs:* ${modelBtus}\n` : '') +
                                `*Cidade / Bairro:* ${location || 'Não informado'}\n` +
                                `*Mensagem/Bairro:* ${message || 'Não informado'}`;

            const encodedText = encodeURIComponent(textMessage);
            const whatsappUrl = `https://wa.me/5551993624454?text=${encodedText}`;

            window.open(whatsappUrl, '_blank');
        }