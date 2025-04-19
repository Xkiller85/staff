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