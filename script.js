'use strict'

class Model {
    #selectAllElement = false;


    constructor() {
        this.api = 'data.json';
        this.data = this.getLocalArr();
    }

    async setLocalArr() {
        try {
            const resp = await fetch(this.api);
            const arr = await resp.json();
            localStorage.setItem('arrData', JSON.stringify(arr));
            this.data = arr;
        } catch (error) {
            console.error(error);
        }
    }

    getLocalArr() {
        let arr = localStorage.getItem('arrData');
        return JSON.parse(arr);
    }

    toggleElement(id) {
        this.data = this.data.map(elem => {
            if(elem.id === +id) {
                return (elem.selected) ? {...elem, selected: false} : {...elem, selected:true};
            } else {
                return {...elem};
            }
        })
    }

    toggleElementAll() {
        this.#selectAllElement = !this.#selectAllElement;

        this.data = this.data.map(elem => {
            return{...elem, selected: this.#selectAllElement};
        });
    };

    deleteElement(id) {
        this.data = this.data.filter(elem => elem.id !== +id);
    }

    deleteSelectedElement() {
        this.data = this.data.filter(elem => elem.selected === false);
    }
}

class View {
    #statusText = ['в продажу', 'відправлено', 'продано'];
    constructor() {
        this.container = document.querySelector('.container');
    }

    get table() {
        return document.querySelector('.table')
    }

    get tableBody() {
        return document.querySelector('.table tbody')
    }

    renderTitle() {
        let html = `<div class="row header">
                        <h1 class="col">Особистий кабінет</h1>
                    </div>`;
        this.container.insertAdjacentHTML('afterbegin', html);
    }

    #renderTable() {
        let html = `<div class="row table">
                        <div class="col">
                            <table class="table table-bordered">
                                ${this.#renderTableHeader()}
                            </table>
                        </div>
                    </div>`;
        this.container.insertAdjacentHTML('beforeend', html);
    }

    #renderTableHeader() {
        return `<tr class="table-primary">
                    <th scope="col">
                        <button type="button" class="btn btn-secondary all">
                            <i class="bi bi-check-lg"></i>
                            Обрати всі лоти
                        </button>
                    </th>
                    <th scope="col">Назва</th>
                    <th scope="col">Ціна</th>
                    <th scope="col">Статус</th>
                    <th scope="col">Операція</th>
                </tr>`;
    }

    #renderRows(data) {
        data.forEach(elem => {
            let html = `<tr class="${elem.selected ? 'table-warning' : ''}" data-id="${elem.id}">
                            <td>
                                <button type="button" class="btn btn-secondary only">
                                    <i class="bi bi-check-lg"></i>
                                </button>
                                <span>${elem.data} ${elem.time}</span>
                            </td>
                            <td>${elem.name}</td>
                            <td>${elem.price}</td>
                            <td>${this.#formatStatus(elem.status)}</td>
                            <td>
                                <button type="button" class="btn btn-primary">
                                    <i class="bi bi-arrow-clockwise"></i>
                                </button>
                                <button type="button" class="btn btn-danger only-delete">
                                    <i class="bi bi-trash-fill"></i>
                                </button>
                            </td>
                        </tr>`;
                        this.tableBody.insertAdjacentHTML('beforeend', html);
            
        });
    }

    #renderEndRow(data) {
        let str = `<tr class="table-dark" ${data.length >= 1 ? 'style="display:table-row"' : 'style="display: none"'}>
                        <td colspan="4">Вибрано ${data.length <= 4 ? (data.length === 1 ? `: ${data.length} елемент` : `: ${data.length} елементи`) : `: ${data.length} елементів`}</td>
                        <td>
                            <button type="button" class="btn btn-primary">
                                <i class="bi bi-arrow-clockwise"></i>
                            </button>
                            <button type="button" class="btn btn-danger all-delete">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </td>
                    </tr>`;
        this.tableBody.insertAdjacentHTML('beforeend', str);
    }

    #formatStatus(n) {
        if(n>0 && n<=3) {
            return this.#statusText[--n];
        } else {
            return 'Статус не визначений'
        }
    }

    #clearTable() {
        if(this.table) {
            this.table.remove();
        }
    }

    toggleFooterRow(data) {
        let arr = data.filter(function(el) {
            return el.selected === true;
        })

        return arr;
    }

    renderEmptyTable() {
        this.#clearTable();
        this.#renderTable();
        this.tableBody.insertAdjacentHTML('beforeend', `<h4>Особистий кабінет порожній!</h4>`);
    }

    render(data) {
        this.#clearTable();
        this.#renderTable();
        this.#renderRows(data);
        this.toggleFooterRow(data);
        this.#renderEndRow(this.toggleFooterRow(data))
    }
}

class Cabinet {
    constructor() {
        this.model = new Model();
        this.view = new View();
    }

    selectRow(even) {
        let target = even.target;

        if(target.matches('.only') || target.matches('.only i')) {
            let id = target.closest('tr').dataset.id;
            this.model.toggleElement(id);
        }

        if(target.matches('.all') || target.matches('.all i')) {
            this.model.toggleElementAll();
        }

        if(this.model.data.length !== 0) {
            this.view.render(this.model.data);
        }
    }

    deleteRow(even) {
        let target = even.target;

        if(target.matches('.only-delete') || target.matches('.only-delete i')) {
            let id = target.closest('tr').dataset.id;
            this.model.deleteElement(id);
            this.view.render(this.model.data);

            if(this.model.data.length === 0) {
                this.view.renderEmptyTable();
            }
        }
    }

    deleteSelectedRow(even) {
        let target = even.target;
        if(target.matches('.all-delete') || target.matches('.all-delete i')) {
            this.model.deleteSelectedElement();
            this.view.render(this.model.data);

            if(this.model.data.length === 0) {
                this.view.renderEmptyTable();
            }
        }
    }

    async init() {
        await this.model.setLocalArr();
        this.view.renderTitle();
        this.view.render(this.model.data);
        document.body.addEventListener('click', this.selectRow.bind(this));
        document.body.addEventListener('click', this.deleteRow.bind(this));
        document.body.addEventListener('click', this.deleteSelectedRow.bind(this));
    }
}
