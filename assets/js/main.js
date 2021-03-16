const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const content = $('#content');
const togglePalate = $('.add__toggle');
const colorPalate = $('.add__palette');
const toggleSettings = $('.settings__toggle');
const boxSettings = $('.settings');
const exportBtn = $('#export');
const importBtn = $('#import');
const resetBtn = $('#reset');

const app = {
    isSaveData: true,
    colorPalate: ['#ffc971', '#ff9b73', '#b692fe', '#01d4ff', '#e4ee90'],
    notes: [],
    Note: class {
        constructor({ id, color, content, date }) {
            this.id = id,
            this.color = color,
            this.content = content,
            this.date = date
        }
        getHTML(){
            const html = `
                <div class="note" note-id='${this.id}' style="background-color:${this.color}">
                    <div class="note__content" contenteditable>
                        ${this.content}
                    </div>
                    <div class="note__info">
                        <span class="note__date">
                            ${this.date}
                        </span>
                        <div class="note__delete">
                            <img src="assets/images/delete-icon.svg">
                        </div>
                    </div>
                </div>
            `;
            return html;
        }
    },
    config: function () {
        window._app = this;
        window.notesEl = $$('#content .note');
        window.notesContent = $$('#content .note .note__content');
        window.deleteBtn = $$('#content .note .note__delete');
        window.addBtn = $$('.add__palette .color');
    },
    setUp: function () {
        this.config();
        this.handelEvent();
    },
    handelData: function () {
        this.setUp();

        // load data
        const notesData = window.localStorage.getItem('notesData');
        if (notesData) {
            _app.notes = JSON.parse(notesData).map(data => JSON.parse(data))
        }

        // save data
        window.addEventListener("beforeunload", function () {
            const notesData = JSON.stringify( _app.notes.map(note => JSON.stringify(note)) );
            window.localStorage.setItem('notesData', notesData);
        })
    },
    render: function () {
        const notesHtml = _app.notes.map(note => new _app.Note(note).getHTML()).join('');
        content.innerHTML = notesHtml;  

        hasColorPalate = colorPalate.querySelector('.color');
        if(!hasColorPalate){
            const colorsHtml = _app.colorPalate.map(color => `<div class="color" color='${color}' style="background-color:${color}"></div>`).join('');
            colorPalate.innerHTML = colorsHtml + colorPalate.innerHTML;
        }

        this.setUp();
    },
    export: function () {
        const isHasNote = _app.notes.length > 0;
        if(isHasNote){
            const notesData = JSON.stringify(_app.notes.map(note => JSON.stringify(note)));
            var a = document.createElement('a');
            a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(notesData));
            a.setAttribute('download', 'note-data.json');

            a.style.display = 'none';
            document.body.appendChild(a);

            a.click();

            a.body.removeChild(a);
        }else{
            alert('You have 0 note to export')
        }
    },
    import: function (file) {
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            const fileData = JSON.parse(evt.target.result).map(note => JSON.parse(note));
            _app.notes = [..._app.notes, ...fileData];
            _app.render();
        }
    },
    add: function (noteColor) {
        var noteID;
        const noteNum = notesEl.length + 1;
        const idExists = [];
        notesEl.forEach((note) => {
            const id = note.getAttribute('note-id') * 1;
            idExists.push(id);
        });
        do {
            const randomNum = Math.floor(Math.random() * noteNum);
            noteID = randomNum;
        }
        while (idExists.includes(noteID));

        const noteDate = _app.customFunction.getDate();
        const noteData = {
            id: noteID,
            color: noteColor,
            content: '',
            date: noteDate
        }
        const note = new _app.Note(noteData);
        const html = note.getHTML();

        _app.notes.unshift(note);
        content.innerHTML = html + content.innerHTML;

        this.setUp();
    },
    delete: function (note) {
        const id = note.getAttribute('note-id');
        _app.notes = _app.notes.filter(note => note.id != id);
        note.remove();
        this.config();
    },
    reset: function () {
        _app.notes = [];
        content.innerHTML = '';
        localStorage.clear();
        this.config();
    },
    handelEvent: function () {
        notesContent.forEach((item) =>   {
            item.addEventListener("input", function () { 
                const id = item.closest('.note').getAttribute('note-id');
                const content = item.innerText;
                const index = _app.notes.findIndex(note => note.id == id);

                _app.notes[index].content = content;
            })
        })

        togglePalate.onclick = function () {
            addBtn.forEach((btn, index) => {
                setTimeout(function () {
                    btn.classList.toggle('active');
                }, index * 300)
            });
            this.classList.toggle('active');
        }

        addBtn.forEach( btn => {
            btn.onclick = () => {
                const color = btn.getAttribute('color');
                _app.add(color);
            }
        })

        deleteBtn.forEach( btn => {
            btn.onclick = () => {
                const noteEl = btn.closest('.note');
                _app.delete(noteEl);
            }
        })

        toggleSettings.onclick = () => boxSettings.classList.toggle('active');
        $('.overlay').onclick = () => boxSettings.classList.remove('active');

        importBtn.onchange = function () {
            _app.import(this.files[0]);
            this.value = '';
        };

        exportBtn.onclick = () => _app.export();

        resetBtn.onclick = () => {
            const isConfirm = confirm("Are You Sure ?");
            if (isConfirm) {
                _app.reset();
            }
        }
    },
    customFunction: {
        // get format date month date, year 
        getDate: function () {
            const time = new Date();
            const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const date = time.getDate();
            const month = monthName[time.getMonth()];
            const year = time.getFullYear();

            return `${month} ${date}, ${year}`;
        }
    },
    start: function () {
        this.handelData();
        this.render();
    }
}
app.start();

