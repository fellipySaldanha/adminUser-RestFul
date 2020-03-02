class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {

        this.formElement = document.getElementById(formIdCreate);
        this.formElementUpdate = document.getElementById(formIdUpdate);
        this.tableElement = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit() {
        document.getElementById('formCancel-update').addEventListener('click', e => {
            this.showPanelCreate();
        })

        this.formElementUpdate.addEventListener('submit', event => {
            event.preventDefault();
            let btn = this.formElementUpdate.querySelector('[type=submit]');
            btn.disabled = true;
            let values = this.getValues(this.formElementUpdate);            
            let index = this.formElementUpdate.dataset.trIndex;
            let tr = this.tableElement.rows[index];
            let userOld = JSON.parse(tr.dataset.user);
            let result = Object.assign({}, userOld, values);                                      

            this.getPhoto(this.formElementUpdate).then(
                (content) => {
                    if(!values.photo){
                        result._photo = userOld._photo;
                    }else{
                        result._photo = content;
                    }                    
                    
                    let user = new User();
                    user.loadFromJSON(result);                    
                    user.save().then(user => {
                        this.getTr(user, tr);                                        
                        this.updateCount();    
                        this.formElementUpdate.reset(result);
                        btn.disabled = false;
                        this.showPanelCreate();
                    });
                },
                (e) => {
                    console.error(e);
                }
            );

        })
    }

    onSubmit() {
        this.formElement.addEventListener('submit', (event) => {
            event.preventDefault();
            let btn = this.formElement.querySelector('[type=submit]');
            btn.disabled = true;
            let values = this.getValues(this.formElement);
          
            if (values) {
                console.log('values '+ JSON.stringify(values));
                this.getPhoto(this.formElement).then(
                    (content) => {
                        values.photo = content;                        
                        values.save().then(user => {
                            this.addLine(user);
                            this.formElement.reset();
                            btn.disabled = false;
                        });
                    },
                    (e) => {
                        console.error(e);
                    }
                );
            }

            btn.disabled = false;
        });
    }

    getPhoto(formElement) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();
            let elements = [...formElement.elements].filter(item => {
                if (item.name === 'photo') {
                    return item;
                }
            });

            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e);
            }
            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }

        });
    }

    getValues(formElement) {
        let user = {};
        let isValid = true;

        [...formElement.elements].forEach(function (field, index) {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false;
            } else {
                field.parentElement.classList.remove('has-error');
            }

            if (field.name == 'gender') {
                if (field.checked) {
                    user[field.name] = field.value;
                    console.log(field.value);
                }
            } else if (field.name == 'admin') {
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }
        });

        if (!isValid) {
            return false;
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );
    }   

    selectAll(){        
        User.getUserStorage().then(data => {
            data.users.forEach(dataUser => {
                let user = new User();
                user.loadFromJSON(dataUser);
                this.addLine(user);
            });
        });
    }

    addLine(dataUser) {                         
        let tr = this.getTr(dataUser);        
        this.tableElement.appendChild(tr);
        this.updateCount();
    }

    getTr(dataUser, tr = null){
        if(tr === null){
            tr = document.createElement('tr');
        }

        tr.dataset.user = JSON.stringify(dataUser);                

        tr.innerHTML = `
        <tr>
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${dataUser.register}</td>
            <td>
                <button type="button" class="btn-edit btn btn-primary btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat btn-delete">Excluir</button>
            </td>
        </tr>
      `;

      this.addEventsTr(tr);
      return tr;
    }

    addEventsTr(tr) {
        tr.querySelector('.btn-delete').addEventListener('click', event => {
            if(confirm('deseja realmente excluir?')){
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));                
                user.delete().then(data => {
                    tr.remove();
                    this.updateCount();
                });
            }
        });

        tr.querySelector('.btn-edit').addEventListener('click', event => {
            let json = JSON.parse(tr.dataset.user);
            

            this.formElementUpdate.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {
                let field = this.formElementUpdate.querySelector('[name=' + name.replace('_', '') + ']');

                if (field) {

                    switch (field.type) {
                        case 'file':
                            continue;
                            break;
                        case 'radio':
                            field = this.formElementUpdate.querySelector('[name=' + name.replace('_', '') + '][value=' + json[name] + ']');
                            console.log(field)
                            console.log('[name=' + name.replace('_', '') + '][value=' + json[name] + ']')
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];
                    }

                }
            }
            this.formElementUpdate.querySelector('.photo').src = json._photo;
            this.showPanelUpdate();
        });
    }

    showPanelCreate() {
        document.getElementById('box-user-create').style.display = 'block';
        document.getElementById('box-user-update').style.display = 'none';
    }

    showPanelUpdate() {
        document.getElementById('box-user-create').style.display = 'none';
        document.getElementById('box-user-update').style.display = 'block';
    }

    updateCount() {
        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableElement.children].forEach(tr => {
            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if (user._admin) {
                numberAdmin++;
            }
        });

        document.querySelector('#number-users').innerHTML = numberUsers;
        document.querySelector('#number-users-admin').innerHTML = numberAdmin;

    }
}