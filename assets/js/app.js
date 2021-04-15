/* 
 * NOTE APP
 * AUTHOR: PhuongNguyen
*/

const app = (function () {
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);

    const $content = $('#content');
    const $togglePalate = $('.add__toggle');
    const $colorPalate = $('.add__palette');
    const $toggleSettings = $('.settings__toggle');
    const $boxSettings = $('.settings');
    const $exportBtn = $('#export');
    const $importBtn = $('#import');
    const $resetBtn = $('#reset');

    const colorPalate = ['#ffc971', '#ff9b73', '#b692fe', '#01d4ff', '#e4ee90'];
    let notes = [];

    /** Note */
    class Note {
        constructor({ id, color, content, date }) {
            this.id = id;
            this.color = color;
            this.content = content;
            this.date = date
        }
        getHTML() {
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
    }

    let $notesEl;
    let $notesContent;
    let $deleteBtn;
    let $addBtn;

    function config() {
        $notesEl = $$('#content .note');
        $notesContent = $$('#content .note .note__content');
        $deleteBtn = $$('#content .note .note__delete');
        $addBtn = $$('.add__palette .color');
    };

    function setUp() {
        config();
        handelEvent();
    };

    function handelData() {
        setUp();

        // update data
        const notesData = window.localStorage.getItem('notesData');
        if (notesData) {
            notes = JSON.parse(notesData).map(data => JSON.parse(data))
        }

        // save data
        window.addEventListener("beforeunload", function () {
            const notesSaveData = JSON.stringify(notes.map(note => JSON.stringify(note)));
            window.localStorage.setItem('notesData', notesSaveData);
        })
    };

    function render() {
        const notesHtml = notes.map(note => new Note(note).getHTML()).join('');
        $content.innerHTML = notesHtml;

        const itemColorHTML = colorPalate.map(color => `<div class="color" color='${color}' style="background-color:${color}"></div>`).join('');
        $colorPalate.innerHTML = itemColorHTML + $colorPalate.innerHTML;

        setUp();
    };

    function exportNote() {
        const isHasNote = notes.length > 0;
        if (!isHasNote) return alert('You have 0 note to export');

        const notesData = JSON.stringify(notes.map(note => JSON.stringify(note)));
        setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(notesData));
        setAttribute('download', 'note-data.json');
    };

    function importNote(file) {
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            const fileData = JSON.parse(evt.target.result).map(note => JSON.parse(note));
            notes = [...notes, ...fileData];
            render();
        }
    };

    function addNote(noteColor) {
        let noteID;
        const noteNum = $notesEl.length + 1;
        const idExists = [];

        $notesEl.forEach((note) => {
            const id = note.getAttribute('note-id') * 1;
            idExists.push(id);
        });

        do {
            const randomNum = Math.floor(Math.random() * noteNum);
            noteID = randomNum;
        }
        while (idExists.includes(noteID));

        const noteDate = getFormatDate();
        const noteData = {
            id: noteID,
            color: noteColor,
            content: '',
            date: noteDate
        }
        const note = new Note(noteData);
        const html = note.getHTML();

        notes.unshift(note);
        $content.innerHTML = html + $content.innerHTML;

        setUp();
    };

    function deleteNote(note) {
        const id = note.getAttribute('note-id');
        notes = notes.filter(note => note.id != id);
        note.remove();
        config();
    };

    function reset() {
        notes = [];
        $content.innerHTML = '';
        localStorage.clear();
    };

    function handelEvent() {
        $notesContent.forEach((item) => {
            item.addEventListener("input", function () {
                const id = item.closest('.note').getAttribute('note-id');
                const content = item.innerText;
                const index = notes.findIndex(note => note.id == id);

                notes[index].content = content;
            })
        })

        $togglePalate.onclick = function () {
            $addBtn.forEach((btn, index) => {
                setTimeout(function () {
                    btn.classList.toggle('active');
                }, index * 300)
            });
            this.classList.toggle('active');
        }

        $addBtn.forEach(btn => {
            btn.onclick = () => {
                const color = btn.getAttribute('color');
                addNote(color);
            }
        })

        $deleteBtn.forEach(btn => {
            btn.onclick = () => {
                const noteEl = btn.closest('.note');
                deleteNote(noteEl);
            }
        })

        $toggleSettings.onclick = () => $boxSettings.classList.toggle('active');
        $('.overlay').onclick = () => $boxSettings.classList.remove('active');

        $importBtn.onchange = function () {
            importNote(files[0]);
            value = '';
        };

        $exportBtn.addEventListener('click', exportNote);

        $resetBtn.onclick = () => {
            const isConfirm = confirm("Are You Sure ?");
            if (isConfirm) reset();
        }
    };

    function getFormatDate() {
        const time = new Date();
        const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const date = time.getDate();
        const month = monthName[time.getMonth()];
        const year = time.getFullYear();

        return `${month} ${date}, ${year}`;
    };

    (function start() {
        handelData();
        render();
    })();

})();

