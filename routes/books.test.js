process.env.NOD_ENV = 'test';
const request = require('supertest');

const app = require('../app');
const db = require('../db');
const Book = require('../models/book');

let book;

describe('Book test routes', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM books');

    book = await Book.create({
      isbn: '0691161518',
      amazon_url: 'http://a.co/eobPtX2',
      author: 'Matthew Lane',
      language: 'english',
      pages: 264,
      publisher: 'Princeton University Press',
      title: 'Power-Up: Unlocking the Hidden Mathematics in Video Games',
      year: 2017,
    });
  });

  describe('/GET books', () => {
    test('Should get a list of books', async () => {
      const resp = await request(app).get('/books');

      expect(resp.body).toEqual({ books: [book] });
      expect(resp.statusCode).toBe(200);
    });
  });

  describe('/GET books/isbn', () => {
    test('Should return a specified book', async () => {
      const resp = await request(app).get(`/books/${book.isbn}`);

      expect(resp.body).toEqual({ book });
      expect(resp.statusCode).toBe(200);
    });
  });

  describe('/POST books', () => {
    test('should create a new book', async () => {
      let book = {
        isbn: '7785789654',
        amazon_url: 'http://a.co/3232',
        author: 'Junji Ito',
        language: 'english',
        pages: 264,
        publisher: 'Some Publisher',
        title: 'Uzamaki',
        year: 2019,
      };
      const resp = await request(app).post(`/books`).send(book);
      expect(resp.body).toEqual({ book });
      expect(resp.statusCode).toEqual(201);
    });

    test('should return a error if amazon url is not a url', async () => {
      let book = {
        isbn: '7785789654',
        amazon_url: 'some string',
        author: 'Junji Ito',
        language: 'english',
        pages: 264,
        publisher: 'Some Publisher',
        title: 'Uzamaki',
        year: 2019,
      };
      const resp = await request(app).post(`/books`).send(book);
      expect(resp.body).toEqual({
        error: {
          message: ['instance.amazon_url does not conform to the "uri" format'],
          status: 400,
        },
        message: ['instance.amazon_url does not conform to the "uri" format'],
      });
      expect(resp.statusCode).toEqual(400);
    });
  });

  describe('/PUT books/ISBN', () => {
    test('should update an  existing book', async () => {
      book.title = 'Update title';
      const resp = await request(app).put(`/books/${book.isbn}`).send(book);
      expect(resp.body).toEqual({ book });
      expect(resp.statusCode).toEqual(200);
    });

    test('should return a error if year is not an int', async () => {
      book.year = '2020';
      const resp = await request(app).put(`/books/${book.isbn}`).send(book);
      expect(resp.body).toEqual({
        error: {
          message: ['instance.year is not of a type(s) integer'],
          status: 400,
        },
        message: ['instance.year is not of a type(s) integer'],
      });
      expect(resp.statusCode).toEqual(400);
    });
  });
  afterAll(async () => {
    await db.end();
  });
});
