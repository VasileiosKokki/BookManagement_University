const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('books.db');


class Book{
    constructor(id, author, title, genre, price){
        this.id = id;
        this.author = author;
        this.title = title;
        this.genre = genre;
        this.price = price;
    }
}


function addBook(db,book){
    try{
        const { author, title, genre, price } = book;

        if (!author || !title || !genre || !price) {
            throw new Error('Missing one or more required fields');
        }

        if (price <= 0){
            throw new Error('Negative and zero values in price are not allowed');
        }

        //const q = `insert into books (author, title, genre, price) values ("${book.author}", "${book.title}", "${book.genre}", "${book.price}")`;
        const q = 'INSERT INTO books (author, title, genre, price) VALUES (?, ?, ?, ?)';
        const values = [author, title, genre, price];
        console.log(q);
        //db.exec(q);
        db.run(q, values);
    }catch(err){
        throw err;
    }
}


// to function auto den to zhtaei h askhsh alla einai voliko gia logous debugging kai glitonei xrono (den xreiazetai na kleiso ton server kai na anoikso thn vash kai na kano select * from books;)
async function getAllBooks(db){
    const q = 'select * from books';
    const rows = await runQuery(db,q);
    books = [];
    for (row of rows){
        book = new Book(row.id,row.author,row.title,row.genre,row.price);
        books.push(book);
    }
    return books;
}


/*
async function getBookById(db,id){
    const q = 'select * from books where id='+id;
    const rows = await runQuery(db,q);
    books = [];
    for (row of rows){
        book = new Book(row.id,row.author,row.title,row.genre,row.price);
        books.push(book);
    }
    return books;
}
*/


async function getBookByTitle(db,title){
    const q = `select * from books where title like '%${title}%'`;
    const rows = await runQuery(db,q);
    books = [];
    for (row of rows){
        book = new Book(row.id,row.author,row.title,row.genre,row.price);
        books.push(book);
    }
    return books;
}


function runQuery(db,q){
    return new Promise((resolve,reject)=>{
        db.all(q,(err,rows)=>{
            if(err){
                console.log('Error accessing the database.');
                reject(err);
            }
            resolve(rows);
        });
    });
}





const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());


app.use(express.static('public'));


// gia to function getAllBooks(db)
app.get('/books',async (req,res)=>{
    try{
        const books = await getAllBooks(db);
        res.json(books);
    }catch(err){
        res.status(500).send(err);
    }  
});


/*
app.get('/books/:id',async (req,res)=>{
    try{
        const id = req.params.id;
        const book = await getBookById(db,id);
        res.json(book);
    }catch(err){
        res.status(500).send(err);
    }  
});
*/


app.get('/books/:title',async (req,res)=>{
    try{
        const title = req.params.title;
        const book = await getBookByTitle(db,title);
        res.json(book);
    }catch(err){
        res.status(500).send(err);
    }  
});


app.post('/books',(req,res)=>{
    const book = req.body;
    console.log(req.body);
    try{
        addBook(db,book);
        //res.end('OK');
        res.json({ success: 'Book added successfully' });
    }catch(err){
        //res.status(500).send(err);
        res.status(500).json({ error: err.message });
    }
});


app.listen(3000);




// entry point 
async function main(){

    try{
        // KATAXORHSH NEOU BOOK
        // const b = new Book("Jack Duck","Sample Title","Horror","23.5");
        // addBook(db,b);
        const result = await getAllBooks(db);
        console.log(result);
    }catch(err){
        console.error(err);
    }
}


// main();