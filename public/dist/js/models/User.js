class User {

    constructor(name, gender, birth, country, email, password, photo, admin) {
        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = Utils.dateFormart(new Date());
    }

    get id(){
        return this._id;
    }

    get name() {
        return this._name;
    }

    get gender() {
        return this._gender;
    }

    get birth() {
        return this._birth;
    }

    get country() {
        return this._country;
    }

    get email() {
        return this._email;
    }

    get password() {
        return this._password;
    }

    get photo() {
        return this._photo;
    }

    get admin() {
        return this._admin;
    }

    get register() {
        return this._register;
    }

    set photo(value) {
        this._photo = value;
    }

    set gender(value) {
        this._gender = value;
    }

    loadFromJSON(json) {
        for (let name in json) {
            switch (name) {
                case 'register':
                    this[name] = new Date(json[name]);
                    break;
                default:
                    if(name.substring(0,1) === '_'){
                        this[name] = json[name];
                    }
            }
        }
    }

    static getUserStorage(){
       return Fetch.get('/users');
    }

    toJSON(){

        let json = {};
        
        Object.keys(this).forEach(key => {           
            if(this[key] !== undefined){               
                json[key] = this[key];
            }
        });       
        return json;
    }

    save(){       
        return new Promise((resolve, reject) => {            
            let promisse;
    
            if (this.id) {                
                promisse = Fetch.put(`/users/${this.id}`, this.toJSON());
            } else {                
                promisse = Fetch.post(`/users/`, this.toJSON());            
            }            
            promisse.then(data => {
                this.loadFromJSON(data);
                
                resolve(this);
            })
            .catch(error =>{ 
                reject(error);
            });
        });
    }

    delete(){        
        return Fetch.delete(`/users/${this.id}`);
    }
}