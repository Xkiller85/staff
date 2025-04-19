document.addEventListener('DOMContentLoaded', function() {
    // Definizione delle sezioni disponibili
    const availableSections = [
        { id: "home", name: "Home", type: "home" },
        { id: "esperienza", name: "Esperienza", type: "experience" },
        { id: "competenze", name: "Competenze", type: "skills" },
        { id: "progetti", name: "Progetti", type: "projects" },
        { id: "contatti", name: "Contatti", type: "contact" },
        { id: "testimonianze", name: "Testimonianze", type: "testimonials" },
        { id: "risultati", name: "Risultati", type: "achievements" },
        { id: "galleria", name: "Galleria", type: "gallery" }
    ];

    // Database utenti
    const defaultUsers = [
        { username: "killer", password: "sonokiller", role: "owner" }
    ];

    // Elementi DOM
    const editModeBtn = document.getElementById('editModeBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const authError = document.getElementById('authError');
    const editModal = document.getElementById('editModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const editContent = document.getElementById('editContent');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const skillModal = document.getElementById('skillModal');
    const closeSkillModal = document.getElementById('closeSkillModal');
    const skillName = document.getElementById('skillName');
    const skillIcon = document.getElementById('skillIcon');
    const skillLevel = document.getElementById('skillLevel');
    const skillLevelValue = document.getElementById('skillLevelValue');
    const saveSkillBtn = document.getElementById('saveSkillBtn');
    const newSkillModal = document.getElementById('newSkillModal');
    const closeNewSkillModal = document.getElementById('closeNewSkillModal');
    const newSkillName = document.getElementById('newSkillName');
    const newSkillIcon = document.getElementById('newSkillIcon');
    const newSkillLevel = document.getElementById('newSkillLevel');
    const newSkillLevelValue = document.getElementById('newSkillLevelValue');
    const addNewSkillBtn = document.getElementById('addNewSkillBtn');
    const addSkillBtn = document.getElementById('addSkillBtn');
    const saveNotification = document.getElementById('saveNotification');
    const saveColorsBtn = document.getElementById('saveColorsBtn');
    const burger = document.getElementById('burger');
    const navLinks = document.getElementById('navLinks');
    const activeSectionsList = document.getElementById('activeSectionsList');
    const addSectionSelect = document.getElementById('addSectionSelect');
    const footerLinks = document.getElementById('footerLinks');
    const sectionManager = document.getElementById('sectionManager');
    const colorPickerContainer = document.querySelector('.color-picker-container');

    // Stato dell'applicazione
    let editMode = false;
    let isAuthenticated = false;
    let currentUser = null;
    let currentEditElement = null;
    let currentSkillBox = null;
    let activeSections = ["home", "esperienza", "competenze", "progetti", "contatti"];
    let users = loadUsers();

    // Carica i dati salvati
    loadSavedData();

    // Inizializza l'interfaccia
    updateNavigation();
    updateSectionVisibility();
    updateSectionManager();
    setupTimelineItemActions();
    setupSocialLinkEditing();

    // Posiziona i pannelli di modifica
    positionEditPanels();

    // Event Listeners
    editModeBtn.addEventListener('click', toggleEditMode);
    logoutBtn.addEventListener('click', handleLogout);
    closeAuthModal.addEventListener('click', () => authModal.style.display = 'none');
    loginBtn.addEventListener('click', handleLogin);
    closeEditModal.addEventListener('click', () => editModal.style.display = 'none');
    saveEditBtn.addEventListener('click', saveEdit);
    closeSkillModal.addEventListener('click', () => skillModal.style.display = 'none');
    saveSkillBtn.addEventListener('click', saveSkill);
    closeNewSkillModal.addEventListener('click', () => newSkillModal.style.display = 'none');
    addNewSkillBtn.addEventListener('click', saveNewSkill);
    addSkillBtn.addEventListener('click', showNewSkillModal);
    saveColorsBtn.addEventListener('click', saveColors);
    burger.addEventListener('click', toggleMobileMenu);
    addSectionSelect.addEventListener('change', handleAddSection);

    // Aggiungi event listener per spostare i pannelli di modifica
    document.addEventListener('mousedown', startDragPanel);

    // Aggiungi event listener per gli elementi editabili
    document.addEventListener('click', function(e) {
        if (!editMode) return;

        // Gestione click su elementi editabili
        if (e.target.closest('.editable')) {
            handleEditableClick(e);
        }

        // Gestione click su pulsanti di eliminazione competenze
        if (e.target.closest('.delete-skill')) {
            handleDeleteSkill(e);
        }

        // Gestione click su pulsanti di modifica competenze
        if (e.target.closest('.edit-skill')) {
            handleEditSkill(e);
        }

        // Gestione click su pulsanti di eliminazione timeline
        if (e.target.closest('.delete-timeline-item')) {
            handleDeleteTimelineItem(e);
        }

        // Gestione click su link social per modifica URL
        if (e.target.closest('.social-icons a') && editMode) {
            handleSocialLinkEdit(e);
        }
    });

    // Aggiorna il valore visualizzato del livello di competenza
    skillLevel.addEventListener('input', function() {
        skillLevelValue.textContent = this.value + '%';
    });

    newSkillLevel.addEventListener('input', function() {
        newSkillLevelValue.textContent = this.value + '%';
    });

    // Funzione per caricare gli utenti dal localStorage o usare quelli predefiniti
    function loadUsers() {
        const savedUsers = localStorage.getItem("portfolioUsers");
        return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
    }

    // Funzione per salvare gli utenti nel localStorage
    function saveUsers() {
        localStorage.setItem("portfolioUsers", JSON.stringify(users));
    }

    // Funzioni per posizionare i pannelli di modifica
    function positionEditPanels() {
        // Posiziona il pannello di gestione sezioni
        if (sectionManager) {
            sectionManager.style.position = 'fixed';
            sectionManager.style.top = '80px';
            sectionManager.style.right = '20px';
            sectionManager.style.zIndex = '1000';
            sectionManager.style.display = 'none';
        }

        // Posiziona il color picker
        if (colorPickerContainer) {
            colorPickerContainer.style.position = 'fixed';
            colorPickerContainer.style.top = '80px';
            colorPickerContainer.style.left = '20px';
            colorPickerContainer.style.zIndex = '1000';
            colorPickerContainer.style.display = 'none';
        }
    }

    // Funzione per iniziare il trascinamento dei pannelli
    function startDragPanel(e) {
        const panel = e.target.closest('.section-manager, .color-picker-container');
        if (!panel || !editMode) return;

        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
            return;
        }

        let offsetX = e.clientX - panel.getBoundingClientRect().left;
        let offsetY = e.clientY - panel.getBoundingClientRect().top;
        
        function dragPanel(e) {
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
        }
        
        function stopDragPanel() {
            document.removeEventListener('mousemove', dragPanel);
            document.removeEventListener('mouseup', stopDragPanel);
        }
        
        document.addEventListener('mousemove', dragPanel);
        document.addEventListener('mouseup', stopDragPanel);
    }

    function loadSavedData() {
        // Carica lo stato di autenticazione
        const authState = localStorage.getItem("isAuthenticated");
        const savedUser = localStorage.getItem("currentUser");
        
        if (authState === "true" && savedUser) {
            isAuthenticated = true;
            currentUser = JSON.parse(savedUser);
            logoutBtn.style.display = 'block';
        }

        // Carica le sezioni attive
        const savedSections = localStorage.getItem("activeSections");
        if (savedSections) {
            activeSections = JSON.parse(savedSections);
        }

        // Carica i colori salvati
        const savedColors = localStorage.getItem("portfolioColors");
        if (savedColors) {
            const colors = JSON.parse(savedColors);
            Object.entries(colors).forEach(([key, value]) => {
                document.documentElement.style.setProperty(`--${key}`, value);
                const colorInput = document.getElementById(`color-${key}`);
                if (colorInput) {
                    colorInput.value = value;
                }
            });
        }

        // Carica i contenuti salvati
        const savedContent = localStorage.getItem("portfolioContent");
        if (savedContent) {
            try {
                const content = JSON.parse(savedContent);
                
                // Ripristina i contenuti editabili
                document.querySelectorAll('.editable[data-edit="text"]').forEach(el => {
                    const id = el.id || generateUniqueId(el);
                    el.id = id;
                    if (content[id]) {
                        el.innerHTML = content[id];
                    }
                });

                // Ripristina le immagini
                document.querySelectorAll('.editable[data-edit="image"]').forEach(el => {
                    const id = el.id || generateUniqueId(el);
                    el.id = id;
                    if (content[id]) {
                        if (el.tagName === 'IMG') {
                            el.src = content[id];
                        } else {
                            el.style.backgroundImage = `url('${content[id]}')`;
                        }
                    }
                });

                // Ripristina gli URL dei social
                document.querySelectorAll('.social-icons a').forEach(el => {
                    const id = el.id || generateUniqueId(el);
                    el.id = id;
                    if (content[id]) {
                        el.href = content[id];
                    }
                });
            } catch (e) {
                console.error("Errore nel caricamento dei contenuti salvati:", e);
            }
        }

        // Carica le competenze salvate
        const savedSkills = localStorage.getItem("portfolioSkills");
        if (savedSkills) {
            try {
                const skills = JSON.parse(savedSkills);
                const skillsContainer = document.querySelector(".skills-container");
                
                if (skillsContainer && skills.length > 0) {
                    // Rimuovi le competenze predefinite
                    skillsContainer.innerHTML = '';
                    
                    // Aggiungi le competenze salvate
                    skills.forEach(skill => {
                        const skillBox = document.createElement("div");
                        skillBox.className = "skill-box";
                        skillBox.dataset.skillId = skill.id;
                        skillBox.innerHTML = `
                            <div class="skill-title">
                                <div class="skill-img">
                                    <i class="${skill.icon}"></i>
                                </div>
                                <h3 class="editable" data-edit="text">${skill.name}</h3>
                            </div>
                            <div class="skill-bar">
                                <span class="skill-per editable" data-edit="skill" style="width: ${skill.level}%;">
                                    <span class="tooltip">${skill.level}%</span>
                                </span>
                            </div>
                            <div class="skill-actions">
                                <button class="delete-skill"><i class="fas fa-trash"></i></button>
                                <button class="edit-skill"><i class="fas fa-pen"></i></button>
                            </div>
                        `;
                        skillsContainer.appendChild(skillBox);
                    });
                }
            } catch (e) {
                console.error("Errore nel caricamento delle competenze salvate:", e);
            }
        }
    }

    // Genera un ID unico per gli elementi senza ID
    function generateUniqueId(element) {
        const type = element.dataset.edit || 'element';
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        return `${type}-${timestamp}-${random}`;
    }

    // Salva tutti i contenuti
    function saveAllContent() {
        // Salva i contenuti editabili
        const content = {};
        
        // Salva i testi
        document.querySelectorAll('.editable[data-edit="text"]').forEach(el => {
            const id = el.id || generateUniqueId(el);
            el.id = id;
            content[id] = el.innerHTML;
        });
        
        // Salva le immagini
        document.querySelectorAll('.editable[data-edit="image"]').forEach(el => {
            const id = el.id || generateUniqueId(el);
            el.id = id;
            if (el.tagName === 'IMG') {
                content[id] = el.src;
            } else {
                content[id] = el.style.backgroundImage.replace(/url$$['"]?(.*?)['"]?$$/i, '$1');
            }
        });

        // Salva gli URL dei social
        document.querySelectorAll('.social-icons a').forEach(el => {
            const id = el.id || generateUniqueId(el);
            el.id = id;
            content[id] = el.href;
        });
        
        localStorage.setItem("portfolioContent", JSON.stringify(content));
        
        // Salva le competenze
        const skills = [];
        document.querySelectorAll('.skill-box').forEach(box => {
            const nameEl = box.querySelector('h3');
            const iconEl = box.querySelector('.skill-img i');
            const perEl = box.querySelector('.skill-per');
            
            if (nameEl && iconEl && perEl) {
                skills.push({
                    id: box.dataset.skillId || Date.now().toString(),
                    name: nameEl.textContent,
                    icon: iconEl.className,
                    level: parseInt(perEl.style.width) || 0
                });
            }
        });
        
        localStorage.setItem("portfolioSkills", JSON.stringify(skills));
        
        showSaveNotification();
    }

    function toggleEditMode() {
        if (!editMode && !isAuthenticated) {
            // Se non siamo in modalità modifica e non siamo autenticati, mostra il modal di autenticazione
            authModal.style.display = 'block';
            // Resetta i campi di input per sicurezza
            usernameInput.value = '';
            passwordInput.value = '';
            return;
        }

        editMode = !editMode;
        document.body.classList.toggle('edit-mode', editMode);
        editModeBtn.classList.toggle('active', editMode);
        editModeBtn.innerHTML = editMode ? 
            '<i class="fas fa-times"></i> Esci dalla Modalità Modifica' : 
            '<i class="fas fa-edit"></i> Modalità Modifica';
        
        // Mostra/nascondi i pannelli di modifica
        if (sectionManager) {
            sectionManager.style.display = editMode ? 'block' : 'none';
        }
        if (colorPickerContainer) {
            colorPickerContainer.style.display = editMode ? 'block' : 'none';
        }
        
        // Aggiorna i pulsanti di eliminazione nella timeline
        setupTimelineItemActions();
    }

    function handleLogin() {
        const username = usernameInput.value;
        const password = passwordInput.value;

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            isAuthenticated = true;
            currentUser = user;
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("currentUser", JSON.stringify(user));
            authModal.style.display = 'none';
            logoutBtn.style.display = 'block';
            toggleEditMode();
            authError.style.display = 'none';
            
            // Mostra pannello admin se l'utente è owner
            if (user.role === 'owner') {
                showAdminPanel();
            }
            
            // Pulisci i campi di input dopo il login
            usernameInput.value = '';
            passwordInput.value = '';
        } else {
            authError.textContent = "Username o password non validi";
            authError.style.display = 'block';
        }
    }

    function handleLogout() {
        isAuthenticated = false;
        currentUser = null;
        editMode = false;
        document.body.classList.remove('edit-mode');
        editModeBtn.classList.remove('active');
        editModeBtn.innerHTML = '<i class="fas fa-edit"></i> Modalità Modifica';
        logoutBtn.style.display = 'none';
        
        // Nascondi pannelli di modifica
        if (sectionManager) {
            sectionManager.style.display = 'none';
        }
        if (colorPickerContainer) {
            colorPickerContainer.style.display = 'none';
        }
        
        // Nascondi pannello admin
        hideAdminPanel();
        
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("currentUser");
    }

    function handleEditableClick(e) {
        const target = e.target.closest('.editable');
        if (!target) return;

        const editType = target.dataset.edit;

        if (editType === "text") {
            currentEditElement = target;
            editContent.value = target.innerHTML;
            editModal.style.display = 'block';
        } else if (editType === "image") {
            if (target.tagName === 'IMG') {
                const imageUrl = prompt("Inserisci l'URL dell'immagine:", target.src);
                if (imageUrl) {
                    target.src = imageUrl;
                    saveAllContent();
                }
            } else {
                const imageUrl = prompt("Inserisci l'URL dell'immagine:", target.style.backgroundImage.replace(/url$$['"]?(.*?)['"]?$$/i, '$1'));
                if (imageUrl) {
                    target.style.backgroundImage = `url('${imageUrl}')`;
                    saveAllContent();
                }
            }
        }
    }

    function saveEdit() {
        if (currentEditElement) {
            currentEditElement.innerHTML = editContent.value;
            editModal.style.display = 'none';
            saveAllContent();
        }
    }

    function handleDeleteSkill(e) {
        const skillBox = e.target.closest('.skill-box');
        if (confirm("Sei sicuro di voler eliminare questa competenza?")) {
            skillBox.remove();
            saveAllContent();
        }
    }

    function handleEditSkill(e) {
        const skillBox = e.target.closest('.skill-box');
        const skillNameElement = skillBox.querySelector('h3');
        const skillIconElement = skillBox.querySelector('.skill-img i');
        const skillPerElement = skillBox.querySelector('.skill-per');

        if (skillNameElement && skillIconElement && skillPerElement) {
            skillName.value = skillNameElement.textContent;
            
            // Estrai la classe dell'icona (es. "fas fa-user-plus" -> "fa-user-plus")
            const iconClasses = skillIconElement.className.split(' ');
            // Cerca la classe che inizia con "fa-" ma non è "fas", "far", ecc.
            const iconClass = iconClasses.find(cls => cls.startsWith('fa-') && !['fas', 'far', 'fab', 'fal', 'fad'].includes(cls));
            
            skillIcon.value = iconClass || '';
            skillLevel.value = parseInt(skillPerElement.style.width) || 0;
            skillLevelValue.textContent = skillLevel.value + '%';
            currentSkillBox = skillBox;
            skillModal.style.display = 'block';
        }
    }

    function saveSkill() {
        if (currentSkillBox) {
            const skillNameElement = currentSkillBox.querySelector('h3');
            const skillIconElement = currentSkillBox.querySelector('.skill-img i');
            const skillPerElement = currentSkillBox.querySelector('.skill-per');
            const tooltipElement = currentSkillBox.querySelector('.tooltip');

            if (skillNameElement && skillIconElement && skillPerElement && tooltipElement) {
                skillNameElement.textContent = skillName.value;
                
                // Usa fas come prefisso per Font Awesome (compatibile con il tuo HTML)
                skillIconElement.className = `fas ${skillIcon.value}`;
                skillPerElement.style.width = `${skillLevel.value}%`;
                tooltipElement.textContent = `${skillLevel.value}%`;

                skillModal.style.display = 'none';
                saveAllContent();
            }
        }
    }

    function showNewSkillModal() {
        if (!editMode) {
            alert("Attiva la modalità di modifica per aggiungere competenze");
            return;
        }

        newSkillName.value = '';
        newSkillIcon.value = '';
        newSkillLevel.value = 75;
        newSkillLevelValue.textContent = '75%';
        newSkillModal.style.display = 'block';
    }

    function saveNewSkill() {
        if (!newSkillName.value) {
            alert("Inserisci un nome per la competenza");
            return;
        }

        const skillsContainer = document.querySelector(".skills-container");
        if (!skillsContainer) return;

        const newSkillId = Date.now(); // ID unico basato sul timestamp

        const newSkill = document.createElement("div");
        newSkill.className = "skill-box";
        newSkill.dataset.skillId = newSkillId.toString();
        newSkill.innerHTML = `
            <div class="skill-title">
                <div class="skill-img">
                    <i class="fas ${newSkillIcon.value || "fa-star"}"></i>
                </div>
                <h3 class="editable" data-edit="text">${newSkillName.value}</h3>
            </div>
            <div class="skill-bar">
                <span class="skill-per editable" data-edit="skill" style="width: ${newSkillLevel.value}%;">
                    <span class="tooltip">${newSkillLevel.value}%</span>
                </span>
            </div>
            <div class="skill-actions">
                <button class="delete-skill"><i class="fas fa-trash"></i></button>
                <button class="edit-skill"><i class="fas fa-pen"></i></button>
            </div>
        `;

        skillsContainer.appendChild(newSkill);
        newSkillModal.style.display = 'none';
        saveAllContent();
    }

    function saveColors() {
        const colors = {};
        document.querySelectorAll('.color-option input[type="color"]').forEach(input => {
            const colorName = input.id.replace('color-', '');
            colors[colorName] = input.value;
            document.documentElement.style.setProperty(`--${colorName}`, input.value);
        });

        localStorage.setItem("portfolioColors", JSON.stringify(colors));
        showSaveNotification();
    }

    function showSaveNotification() {
        saveNotification.classList.add('show');
        setTimeout(() => {
            saveNotification.classList.remove('show');
        }, 3000);
    }

    function toggleMobileMenu() {
        navLinks.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    }

    function updateNavigation() {
        // Aggiorna i link di navigazione
        navLinks.innerHTML = '';
        footerLinks.innerHTML = '';

        availableSections.forEach((section, index) => {
            if (activeSections.includes(section.id)) {
                const navItem = document.createElement('li');
                
                // Aggiungi link
                const link = document.createElement('a');
                link.href = `#${section.id}`;
                link.textContent = section.name;
                navItem.appendChild(link);
                
                // Aggiungi separatore | dopo il link (tranne l'ultimo)
                if (index < activeSections.length - 1) {
                    const separator = document.createElement('span');
                    separator.className = 'nav-separator';
                    separator.innerHTML = '&nbsp;|&nbsp;';
                    navItem.appendChild(separator);
                }
                
                navLinks.appendChild(navItem);

                const footerItem = document.createElement('li');
                footerItem.innerHTML = `<a href="#${section.id}">${section.name}</a>`;
                footerLinks.appendChild(footerItem);
            }
        });
    }

    function updateSectionVisibility() {
        // Mostra/nascondi sezioni in base all'array activeSections
        document.querySelectorAll('.section-container').forEach(section => {
            const sectionId = section.getAttribute('data-section-id');
            if (activeSections.includes(sectionId)) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
    }

    function updateSectionManager() {
        // Aggiorna la lista delle sezioni attive
        activeSectionsList.innerHTML = '';
        activeSections.forEach(sectionId => {
            const section = availableSections.find(s => s.id === sectionId);
            if (section) {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    ${section.name}
                    ${section.id !== 'home' ? `<button class="btn-icon" data-section-id="${section.id}" title="Rimuovi sezione"><i class="fas fa-trash"></i></button>` : ''}
                `;
                activeSectionsList.appendChild(listItem);

                // Aggiungi event listener per il pulsante di rimozione
                const removeBtn = listItem.querySelector('.btn-icon');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function() {
                        handleRemoveSection(this.getAttribute('data-section-id'));
                    });
                }
            }
        });

        // Aggiorna il select per aggiungere sezioni
        addSectionSelect.innerHTML = '<option value="" disabled selected>Seleziona una sezione da aggiungere</option>';
        availableSections.forEach(section => {
            if (!activeSections.includes(section.id)) {
                const option = document.createElement('option');
                option.value = section.type;
                option.textContent = section.name;
                addSectionSelect.appendChild(option);
            }
        });
    }

    function handleAddSection(e) {
        const sectionType = e.target.value;
        if (!sectionType) return;

        const section = availableSections.find(s => s.type === sectionType);
        if (!section) return;

        activeSections.push(section.id);
        localStorage.setItem("activeSections", JSON.stringify(activeSections));
        
        updateNavigation();
        updateSectionVisibility();
        updateSectionManager();
        showSaveNotification();
        
        // Reset select
        e.target.value = '';
    }

    function handleRemoveSection(sectionId) {
        if (sectionId === "home") {
            alert("La sezione Home non può essere rimossa");
            return;
        }

        activeSections = activeSections.filter(id => id !== sectionId);
        localStorage.setItem("activeSections", JSON.stringify(activeSections));
        
        updateNavigation();
        updateSectionVisibility();
        updateSectionManager();
        saveAllContent();
    }

    // Funzioni per la gestione della timeline
    function setupTimelineItemActions() {
        if (!editMode) return;

        // Aggiungi pulsanti di eliminazione agli elementi della timeline
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            // Verifica se il pulsante di eliminazione esiste già
            if (!item.querySelector('.delete-timeline-item')) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-timeline-item';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.title = 'Elimina elemento';
                item.appendChild(deleteBtn);
            }
        });

        // Aggiungi pulsante per aggiungere nuovi elementi alla timeline
        const timeline = document.querySelector('.timeline');
        if (timeline && !timeline.querySelector('.add-timeline-item')) {
            const addBtn = document.createElement('button');
            addBtn.className = 'add-timeline-item btn btn-primary';
            addBtn.innerHTML = '<i class="fas fa-plus"></i> Aggiungi Esperienza';
            addBtn.addEventListener('click', addNewTimelineItem);
            timeline.appendChild(addBtn);
        }
    }

    function handleDeleteTimelineItem(e) {
        const timelineItem = e.target.closest('.timeline-item');
        if (confirm("Sei sicuro di voler eliminare questa esperienza?")) {
            timelineItem.remove();
            saveAllContent();
        }
    }

    function addNewTimelineItem() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;

        const newItem = document.createElement('div');
        newItem.className = 'timeline-item';
        newItem.innerHTML = `
            <div class="timeline-icon">
                <i class="fas fa-briefcase"></i>
            </div>
            <div class="timeline-content">
                <h3 class="editable" data-edit="text">Nuova Esperienza</h3>
                <span class="date editable" data-edit="text">Anno - Anno</span>
                <p class="editable" data-edit="text">Descrizione della nuova esperienza...</p>
            </div>
            <button class="delete-timeline-item" title="Elimina elemento">
                <i class="fas fa-trash"></i>
            </button>
        `;

        // Inserisci prima del pulsante di aggiunta
        const addBtn = timeline.querySelector('.add-timeline-item');
        timeline.insertBefore(newItem, addBtn);
        saveAllContent();
    }

    // Funzioni per la gestione dei social
    function setupSocialLinkEditing() {
        const socialIcons = document.querySelectorAll('.social-icons a');
        socialIcons.forEach(link => {
            if (!link.id) {
                link.id = generateUniqueId(link);
            }
        });
    }

    function handleSocialLinkEdit(e) {
        e.preventDefault();
        const link = e.target.closest('a');
        const newUrl = prompt("Inserisci l'URL del social:", link.href);
        if (newUrl) {
            link.href = newUrl;
            saveAllContent();
        }
    }

    // Funzioni per la gestione degli utenti (solo per owner)
    function showAdminPanel() {
        // Crea il pannello admin se non esiste
        if (!document.getElementById('adminPanel')) {
            const adminPanel = document.createElement('div');
            adminPanel.id = 'adminPanel';
            adminPanel.className = 'admin-panel';
            adminPanel.style.position = 'fixed';
            adminPanel.style.top = '150px';
            adminPanel.style.right = '20px';
            adminPanel.style.zIndex = '1000';
            adminPanel.style.backgroundColor = '#fff';
            adminPanel.style.padding = '15px';
            adminPanel.style.borderRadius = '5px';
            adminPanel.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
            adminPanel.style.maxWidth = '400px';
            adminPanel.style.maxHeight = '80vh';
            adminPanel.style.overflow = 'auto';
            
            adminPanel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0;">Pannello Amministratore</h3>
                    <button id="closeAdminPanel" style="background: none; border: none; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="admin-section">
                    <h4>Gestione Utenti</h4>
                    <div class="user-list" style="margin-bottom: 10px;">
                        <table id="userTable" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ddd;">Username</th>
                                    <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ddd;">Ruolo</th>
                                    <th style="text-align: left; padding: 5px; border-bottom: 1px solid #ddd;">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Gli utenti verranno inseriti qui dinamicamente -->
                            </tbody>
                        </table>
                    </div>
                    <button id="addUserBtn" class="btn btn-primary">
                        <i class="fas fa-user-plus"></i> Aggiungi Utente
                    </button>
                </div>
                <div class="admin-section" style="margin-top: 20px;">
                    <h4>Esporta/Importa Dati</h4>
                    <button id="exportDataBtn" class="btn btn-primary" style="margin-right: 10px;">
                        <i class="fas fa-download"></i> Esporta Dati
                    </button>
                    <button id="importDataBtn" class="btn btn-secondary">
                        <i class="fas fa-upload"></i> Importa Dati
                    </button>
                    <input type="file" id="importFileInput" style="display: none;">
                </div>
            `;
            document.body.appendChild(adminPanel);

            // Aggiungi event listener per il pulsante di chiusura
            document.getElementById('closeAdminPanel').addEventListener('click', () => {
                adminPanel.style.display = 'none';
            });

            // Aggiungi event listener per il trascinamento del pannello
            adminPanel.addEventListener('mousedown', startDragPanel);

            // Popola la tabella degli utenti
            updateUserTable();

            // Aggiungi event listener per i pulsanti
            document.getElementById('addUserBtn').addEventListener('click', showAddUserModal);
            document.getElementById('exportDataBtn').addEventListener('click', exportData);
            document.getElementById('importDataBtn').addEventListener('click', () => {
                document.getElementById('importFileInput').click();
            });
            document.getElementById('importFileInput').addEventListener('change', importData);
        } else {
            document.getElementById('adminPanel').style.display = 'block';
            updateUserTable();
        }
    }

    function hideAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'none';
        }
    }

    function updateUserTable() {
        const userTableBody = document.querySelector('#userTable tbody');
        if (!userTableBody) return;

        userTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 5px; border-bottom: 1px solid #ddd;">${user.username}</td>
                <td style="padding: 5px; border-bottom: 1px solid #ddd;">${user.role}</td>
                <td style="padding: 5px; border-bottom: 1px solid #ddd;">
                    ${user.username !== 'killer' ? `
                        <button class="btn-icon edit-user" data-username="${user.username}" style="margin-right: 5px;">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="btn-icon delete-user" data-username="${user.username}">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : 'Owner (non modificabile)'}
                </td>
            `;
            userTableBody.appendChild(row);
        });

        // Aggiungi event listener per i pulsanti di modifica e eliminazione
        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.getAttribute('data-username');
                editUser(username);
            });
        });

        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const username = this.getAttribute('data-username');
                deleteUser(username);
            });
        });
    }

    function showAddUserModal() {
        // Crea il modal se non esiste
        if (!document.getElementById('userModal')) {
            const modal = document.createElement('div');
            modal.id = 'userModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal" id="closeUserModal">&times;</span>
                    <h2 id="userModalTitle">Aggiungi Utente</h2>
                    <div class="edit-form">
                        <div class="form-group">
                            <label for="userUsername">Username</label>
                            <input type="text" id="userUsername">
                        </div>
                        <div class="form-group">
                            <label for="userPassword">Password</label>
                            <input type="password" id="userPassword">
                        </div>
                        <div class="form-group">
                            <label for="userRole">Ruolo</label>
                            <select id="userRole">
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" id="saveUserBtn">Salva</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Aggiungi event listener
            document.getElementById('closeUserModal').addEventListener('click', () => {
                document.getElementById('userModal').style.display = 'none';
            });

            document.getElementById('saveUserBtn').addEventListener('click', saveUser);
        }

        // Reset form e mostra modal
        document.getElementById('userModalTitle').textContent = 'Aggiungi Utente';
        document.getElementById('userUsername').value = '';
        document.getElementById('userPassword').value = '';
        document.getElementById('userRole').value = 'editor';
        document.getElementById('userUsername').disabled = false;
        document.getElementById('userModal').style.display = 'block';
    }

    function editUser(username) {
        const user = users.find(u => u.username === username);
        if (!user) return;

        document.getElementById('userModalTitle').textContent = 'Modifica Utente';
        document.getElementById('userUsername').value = user.username;
        document.getElementById('userUsername').disabled = true;
        document.getElementById('userPassword').value = '';
        document.getElementById('userRole').value = user.role;
        document.getElementById('userModal').style.display = 'block';
    }

    function saveUser() {
        const username = document.getElementById('userUsername').value;
        const password = document.getElementById('userPassword').value;
        const role = document.getElementById('userRole').value;

        if (!username || !password) {
            alert('Username e password sono obbligatori');
            return;
        }

        // Verifica se stiamo modificando o aggiungendo
        const existingUserIndex = users.findIndex(u => u.username === username);
        
        if (existingUserIndex >= 0) {
            // Modifica utente esistente
            users[existingUserIndex].password = password;
            users[existingUserIndex].role = role;
        } else {
            // Aggiungi nuovo utente
            users.push({
                username,
                password,
                role
            });
        }

        // Salva gli utenti
        saveUsers();
        
        // Aggiorna la tabella e chiudi il modal
        updateUserTable();
        document.getElementById('userModal').style.display = 'none';
        showSaveNotification();
    }

    function deleteUser(username) {
        if (confirm(`Sei sicuro di voler eliminare l'utente ${username}?`)) {
            users = users.filter(u => u.username !== username);
            saveUsers();
            updateUserTable();
            showSaveNotification();
        }
    }

    // Funzioni per esportare e importare dati
    function exportData() {
        const exportData = {
            users: users,
            activeSections: activeSections,
            colors: JSON.parse(localStorage.getItem("portfolioColors") || "{}"),
            content: JSON.parse(localStorage.getItem("portfolioContent") || "{}"),
            skills: JSON.parse(localStorage.getItem("portfolioSkills") || "[]")
        };

        const dataStr = JSON.stringify(exportData);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'portfolio-data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    function importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Importa utenti
                if (importData.users && Array.isArray(importData.users)) {
                    // Assicurati che l'utente owner sia sempre presente
                    const ownerExists = importData.users.some(u => u.username === 'killer' && u.role === 'owner');
                    if (!ownerExists) {
                        importData.users.push({
                            username: 'killer',
                            password: 'sonokiller',
                            role: 'owner'
                        });
                    }
                    users = importData.users;
                    saveUsers();
                }
                
                // Importa sezioni attive
                if (importData.activeSections && Array.isArray(importData.activeSections)) {
                    activeSections = importData.activeSections;
                    localStorage.setItem("activeSections", JSON.stringify(activeSections));
                }
                
                // Importa colori
                if (importData.colors && typeof importData.colors === 'object') {
                    localStorage.setItem("portfolioColors", JSON.stringify(importData.colors));
                }
                
                // Importa contenuti
                if (importData.content && typeof importData.content === 'object') {
                    localStorage.setItem("portfolioContent", JSON.stringify(importData.content));
                }
                
                // Importa competenze
                if (importData.skills && Array.isArray(importData.skills)) {
                    localStorage.setItem("portfolioSkills", JSON.stringify(importData.skills));
                }
                
                alert('Dati importati con successo! La pagina verrà ricaricata.');
                location.reload();
            } catch (error) {
                alert('Errore durante l\'importazione dei dati: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Crea il file database.js
    function createDatabaseFile() {
        const dbCode = `
// database.js - Gestione del database utenti per il portfolio

class PortfolioDatabase {
    constructor() {
        this.defaultUsers = [
            { username: "killer", password: "sonokiller", role: "owner" }
        ];
        this.users = this.loadUsers();
    }

    // Carica gli utenti dal localStorage
    loadUsers() {
        const savedUsers = localStorage.getItem("portfolioUsers");
        return savedUsers ? JSON.parse(savedUsers) : this.defaultUsers;
    }

    // Salva gli utenti nel localStorage
    saveUsers() {
        localStorage.setItem("portfolioUsers", JSON.stringify(this.users));
    }

    // Ottieni tutti gli utenti
    getAllUsers() {
        return this.users;
    }

    // Ottieni un utente specifico
    getUser(username) {
        return this.users.find(u => u.username === username);
    }

    // Verifica le credenziali di un utente
    verifyCredentials(username, password) {
        const user = this.getUser(username);
        return user && user.password === password ? user : null;
    }

    // Aggiungi un nuovo utente
    addUser(username, password, role = "editor") {
        // Verifica se l'utente esiste già
        if (this.getUser(username)) {
            return { success: false, message: "L'utente esiste già" };
        }

        // Aggiungi il nuovo utente
        this.users.push({
            username,
            password,
            role
        });

        this.saveUsers();
        return { success: true, message: "Utente aggiunto con successo" };
    }

    // Aggiorna un utente esistente
    updateUser(username, data) {
        const userIndex = this.users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            return { success: false, message: "Utente non trovato" };
        }

        // Non permettere di modificare l'utente owner
        if (username === "killer" && this.users[userIndex].role === "owner") {
            return { success: false, message: "Non è possibile modificare l'utente owner" };
        }

        // Aggiorna i dati dell'utente
        this.users[userIndex] = {
            ...this.users[userIndex],
            ...data
        };

        this.saveUsers();
        return { success: true, message: "Utente aggiornato con successo" };
    }

    // Elimina un utente
    deleteUser(username) {
        // Non permettere di eliminare l'utente owner
        if (username === "killer") {
            return { success: false, message: "Non è possibile eliminare l'utente owner" };
        }

        const initialLength = this.users.length;
        this.users = this.users.filter(u => u.username !== username);
        
        if (this.users.length === initialLength) {
            return { success: false, message: "Utente non trovato" };
        }

        this.saveUsers();
        return { success: true, message: "Utente eliminato con successo" };
    }

    // Esporta tutti i dati
    exportData() {
        return {
            users: this.users,
            activeSections: JSON.parse(localStorage.getItem("activeSections") || "[]"),
            colors: JSON.parse(localStorage.getItem("portfolioColors") || "{}"),
            content: JSON.parse(localStorage.getItem("portfolioContent") || "{}"),
            skills: JSON.parse(localStorage.getItem("portfolioSkills") || "[]")
        };
    }

    // Importa dati
    importData(data) {
        try {
            // Importa utenti
            if (data.users && Array.isArray(data.users)) {
                // Assicurati che l'utente owner sia sempre presente
                const ownerExists = data.users.some(u => u.username === 'killer' && u.role === 'owner');
                if (!ownerExists) {
                    data.users.push({
                        username: 'killer',
                        password: 'sonokiller',
                        role: 'owner'
                    });
                }
                this.users = data.users;
                this.saveUsers();
            }
            
            // Importa sezioni attive
            if (data.activeSections && Array.isArray(data.activeSections)) {
                localStorage.setItem("activeSections", JSON.stringify(data.activeSections));
            }
            
            // Importa colori
            if (data.colors && typeof data.colors === 'object') {
                localStorage.setItem("portfolioColors", JSON.stringify(data.colors));
            }
            
            // Importa contenuti
            if (data.content && typeof data.content === 'object') {
                localStorage.setItem("portfolioContent", JSON.stringify(data.content));
            }
            
            // Importa competenze
            if (data.skills && Array.isArray(data.skills)) {
                localStorage.setItem("portfolioSkills", JSON.stringify(data.skills));
            }
            
            return { success: true, message: "Dati importati con successo" };
        } catch (error) {
            return { success: false, message: "Errore durante l'importazione: " + error.message };
        }
    }
}

// Esporta l'istanza del database
const portfolioDB = new PortfolioDatabase();
`;
        return dbCode;
    }

    // Crea il file database.js se richiesto
    if (currentUser && currentUser.role === 'owner') {
        console.log("File database.js creato e disponibile per l'utente owner");
        console.log(createDatabaseFile());
    }
});