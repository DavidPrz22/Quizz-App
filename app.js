document.addEventListener('DOMContentLoaded', ()=>{
    
    const questions = [
        {category: "sports", question: "Who holds the record for the most Olympic gold medals in history?", options: ["Usain Bolt", "Michael Phelps", "Simone Biles"], answer:"Michael Phelps"},
        {category: "sports", question: "In which sport would you perform a 'slam dunk'?", options: ["Tennis", "Volleyball", "Basketball"], answer:"Basketball"},
        {category: "sports", question: "Which country won the first-ever FIFA World Cup in 1930?", options: ["Brazil", "Uruguay", "Germany"], answer:"Uruguay"},
        {category: "sports", question: "How many players are there on a standard soccer (football) team on the field at one time?", options: ["10", "11", "12"], answer:"11"},
        {category: "sports", question: "Who is known as 'The King of Clay' in tennis?", options: ["Roger Federer", "Rafael Nadal", "Novak Djokovic"], answer:"Rafael Nadal"},

        {category: "literature", question: "Who wrote the novel Pride and Prejudice?", options: ["Jane Austen", "Charlotte Brontë", "Emily Dickinson"], answer:"Jane Austen"},
        {category: "literature", question: "In George Orwell's 1984, what is the name of the oppressive government surveillance system?", options: ["Big Brother", "The Thought Police", "Ministry of Peace"], answer:"Big Brother"},
        {category: "literature", question: "Who wrote the epic poem The Odyssey?", options: ["Virgil", "Homer", "Sophocles"], answer:"Homer"},
        {category: "literature", question: "Which book series features a young wizard named Harry Potter?", options: ["The Chronicles of Narnia", "Percy Jackson & the Olympians", "Harry Potter"], answer:"Harry Potter"},
       
        {category: "science", question: "What is the most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], answer:"Nitrogen"},
        {category: "science", question: "What planet is known as the 'Red Planet'?", options: ["Venus", "Jupiter", "Mars", "Saturn"], answer:"Mars"},
        {category: "science", question: "Which part of the cell is responsible for generating energy?", options: ["Ribosome", "Nucleus", "Mitochondria", "Golgi apparatus"], answer:"Mitochondria"},
        {category: "science", question: "Who developed the theory of general relativity?", options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Stephen Hawking"], answer:"Albert Einstein"},
        {category: "science", question: "What type of bond involves the sharing of electron pairs between atoms?", options: ["Ionic bond", "Metallic bond", "Covalent bond", "Hydrogen bond"], answer:"Covalent bond"}
    ]


    const user_game_data = [
        {category: 'sports', correctAnswers: 0, wrongAnwers: 0},
        {category: 'literature', correctAnswers: 0, wrongAnwers: 0},
        {category: 'science', correctAnswers: 0, wrongAnwers: 0},
    ];

    const totalAnswersCount = {correctAnswersTotal: 0, wrongAnswerTotal: 0};

    let answerCount = JSON.parse(localStorage.getItem('total_score'));
    let gameCount = JSON.parse(localStorage.getItem('game_data'));
    
    if (!answerCount) {
        localStorage.setItem('total_score', JSON.stringify(totalAnswersCount));
    }
    
    if(!gameCount) {
        localStorage.setItem('game_data', JSON.stringify(user_game_data));
    }

    const current_session_data = [];

    let game_questions = [];
    let correct_questions = 0; 
    let wrong_questions = 0;
    let total_questions = 0;
    let score = 0;

    let time_in_quizz = 60;

    let interval;
    let timer_degrees = 0;

    let enableTimer = false;

    const categories = document.querySelectorAll('.category');
    const questions_per_category = document.querySelector('.category-questions');

    const play_button = document.querySelector('.btn-play');

    const start_Menu = document.querySelector(".start-menu");
    const toggleTimer = start_Menu.querySelector('input#timer');

    const game_ui = document.querySelector('.game');
    const end_game_screen = document.querySelector('.end-game');

    const options_ingame = document.querySelector('.options');

    const next_question_btn = game_ui.querySelector('.next-question');
    const score_display = document.querySelector('.points');

    const quizzTimer = game_ui.querySelector('.quizz-timer');
    const timer_gradient = game_ui.querySelector('.timer-content');

    categories.forEach(e => e.addEventListener('click', categoriesSelection));
    toggleTimer.addEventListener('change', ()=> {

        if (!enableTimer) enableTimer = true;
        else enableTimer = false;
    })
    
    start_Menu.querySelector('.show-table').addEventListener('click', toggleTable);

    let random_category = ['sports', 'literature', 'science']
    let category_ingame = random_category[Math.floor(Math.random() * random_category.length)];
    let question_index = 0;

    function categoriesSelection(e) {

        if (document.querySelector('.selected')) document.querySelector('.selected').classList.remove('selected')
        e.target.classList.add('selected'); 
        questions_per_category.innerText = e.target.dataset.questionCount;
        category_ingame = e.target.dataset.category;
    }

    play_button.addEventListener('click', ()=>{
        start_Menu.classList.add('hidden');
        game_ui.classList.remove('hidden');

        if (!enableTimer) {
            game_ui.querySelector('.numbers .timer').style.visibility = 'hidden';
        } else {
            game_ui.querySelector('.numbers .timer').style.visibility = 'visible';
        }
        
        displayQuestion();
    });

    options_ingame.addEventListener('click', checkAnswer);

    next_question_btn.addEventListener("click", () => {

        if (question_index == (total_questions)) {
            game_ui.classList.add('hidden');
            end_game_screen.classList.remove('hidden');

            UpdateDataGame();
            
            current_session_data.push({index: current_session_data.length + 1, category: category_ingame, corrrect: correct_questions, wrong: wrong_questions});
            end_game_screen.querySelector('.answers').innerText = `${correct_questions} / ${total_questions}`;
            end_game_screen.querySelector('.score').innerText = `${score}`;
        
            let answerCount = JSON.parse(localStorage.getItem('total_score'));
            let gameCount = JSON.parse(localStorage.getItem('game_data'));
            
            answerCount.correctAnswersTotal += totalAnswersCount.correctAnswersTotal;
            answerCount.wrongAnswerTotal += totalAnswersCount.wrongAnswerTotal;
            
            gameCount.forEach((element, index) => {
                for (let property in element) {
                    if (property != 'category') {
                        element[property] += user_game_data[index][property];
                    }
                }
            });

            localStorage.setItem('game_data', JSON.stringify(gameCount));
            localStorage.setItem('total_score', JSON.stringify(answerCount));

            end_game_screen.querySelector('.play-again').addEventListener('click', reset);
        } else {

            if (enableTimer) {
                time_in_quizz = 60;
                timer_degrees = 0;
            }
            displayQuestion();
        }
        
    });

    function checkAnswer(e) {  

        let options = game_ui.querySelectorAll('.option');
        let score_container = document.querySelector('.score');

        if (e.target.matches('.leftover') || e.target.matches('.correct') || e.target.matches('.wrong')) return;

        if (e.target.innerText == game_questions[question_index].answer) {
            e.target.classList.add('correct');
            e.target.classList.add('targeted');

            options.forEach(el => {
                if (!el.matches('.correct')) el.classList.add('leftover');
            })

            correct_questions += 1;
            score += 500;
            score_container.classList.add('increase-points');
            setTimeout(()=> score_container.classList.remove('increase-points'), 450);
            score_display.innerText = score;

            if (enableTimer) clearInterval(interval);
        } else {

            if (!e.target.matches('.option')) return;

            e.target.classList.add('wrong');
            e.target.classList.add('targeted');
            options.forEach(el => {
                if (el.innerText == game_questions[question_index].answer)
                    el.classList.add('correct');
                else 
                    if (!el.matches('.wrong')) el.classList.add('leftover');
            })
            
            wrong_questions += 1;
            if (enableTimer) clearInterval(interval);
        }
        
        if (question_index == total_questions - 1) {
            question_index += 1;
            next_question_btn.style.display = 'flex';
            next_question_btn.innerHTML = 'See Results <i class="fa-solid fa-arrow-right"></i>';
        } else {

            question_index += 1;
            next_question_btn.style.display = 'flex';
        }
    }

    function displayQuestion() {

        options_ingame.replaceChildren();
        quizzTimer.innerText = time_in_quizz;
        if (enableTimer) startTimer();

        game_questions = questions.filter( e => e.category == category_ingame);
        total_questions = game_questions.length;

        game_ui.querySelector('.category-header').innerText = category_ingame;
        game_ui.querySelector('.count').innerText = `${question_index + 1} of ${total_questions}`;
        next_question_btn.style.display = 'none';
        
        
        if (enableTimer) {
            quizzTimer.innerText = time_in_quizz;
            timer_gradient.style.backgroundImage = `conic-gradient(white 0deg ${timer_degrees}deg, orange ${timer_degrees}deg 360deg)`;
        }

        game_ui.querySelector('.question').innerText = game_questions[question_index].question;

        let total_options = game_questions[question_index].options.length;

        for (let i = 0; i < total_options; i++) {

            let option = printOption();
            option.innerText = game_questions[question_index].options[i];
            options_ingame.appendChild(option);
        }
    }

    function UpdateDataGame() {
        user_game_data.forEach((element) => {
            
            if (element.category == category_ingame) {
                element.correctAnswers += correct_questions;
                element.wrongAnwers += wrong_questions;

                totalAnswersCount.correctAnswersTotal = correct_questions;
                totalAnswersCount.wrongAnswerTotal = wrong_questions;
            }
        });
    }

    function reset(){

        end_game_screen.classList.add('hidden');
        start_Menu.classList.remove('hidden');

        correct_questions = 0;
        wrong_questions = 0;
        total_questions = 0;
        question_index = 0;
        score = 0;
        timer_degrees = 0;
        time_in_quizz = 60;
        score_display.innerText = score;

        user_game_data.forEach((e)=>{
            for (let i in e) if (i != 'category') e[i] = 0;
        });
    }

    function printOption() {

        let option = document.createElement('div');
        option.classList.add('option');
        return option;
    }

    function startTimer() {
        interval = setInterval(updateTimer, 1000);
    }

    function updateTimer(){
        timer_degrees += 6;
        time_in_quizz -= 1;

        if (time_in_quizz == 0) {

            let options = game_ui.querySelectorAll('.option');

            options.forEach(e => {
                if (e.innerText == game_questions[question_index].answer)
                    e.classList.add('correct');
            });
            options.forEach(el => {
                if (!el.matches('.correct')) el.classList.add('leftover');
            })

            wrong_questions += 1;
            clearInterval(interval);

            if (question_index == total_questions - 1) {
                question_index += 1;
                next_question_btn.style.display = 'flex';
                next_question_btn.innerHTML = 'See Results <i class="fa-solid fa-arrow-right"></i>';
            } else {
    
                question_index += 1;
                next_question_btn.style.display = 'flex';
            }

        }

        quizzTimer.innerText = time_in_quizz;
        timer_gradient.style.backgroundImage = `conic-gradient(white 0deg ${timer_degrees}deg, orange ${timer_degrees}deg 360deg)`;
    }

    function toggleTable(){

        let table_container = start_Menu.querySelector('.table-container');
        table_container.classList.remove('hidden');
        createFirstTable();
        createSecondTable();
        createrThirdTable();

        let close_table = table_container.querySelector('.close');
        close_table.addEventListener('click', ()=>{
            table_container.classList.add('hidden')
        })
    }

    function createFirstTable(){
        let fragment = document.createDocumentFragment();
        let gameAnswer = JSON.parse(localStorage.getItem('game_data'));

        gameAnswer.forEach((el) => {
            let row = document.createElement('tr');

            for (let i in el) {
                let td = document.createElement('td');
                td.innerText = el[i];
                row.appendChild(td);
            }

            fragment.appendChild(row);
        })

        let table = document.querySelector('.first-table-body');
        table.replaceChildren();
        table.appendChild(fragment);

    }

    function createSecondTable(){

        let answerCount = JSON.parse(localStorage.getItem('total_score'));

        let row = document.createElement('tr');

        for (let property in answerCount){
        
            let td = document.createElement('td');
            td.innerText = answerCount[property];
            row.append(td);
        }

        let table = document.querySelector('.second-table-body');
        table.replaceChildren();
        table.appendChild(row);
    }

    function createrThirdTable(){
        let count = current_session_data.length;
        let table = document.querySelector('.third-table-body');
        table.replaceChildren();

        if (count > 0) {
            document.querySelector('.third-table').style.display = 'block';
            let fragment = document.createDocumentFragment();

            current_session_data.forEach((el)=>{
                let row = document.createElement('tr');
                for (let i in el) {
                        let td = document.createElement('td');
                        td.innerText = el[i];
                        row.appendChild(td);
                }
    
                fragment.appendChild(row);
            });

            table.appendChild(fragment);
        } else {

            document.querySelector('.third-table').style.display = 'none';
        }
        
    }
    
});