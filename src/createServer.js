'use strict';

const express = require('express');

function createServer() {
  const app = express();

  let users = [];
  let expenses = [];

  // #region users methods

  app.get('/users', (req, res) => {
    return res.status(200).json(users);
  });

  app.get('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).send('Invalid id');
    }

    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.sendStatus(404);
    }

    return res.status(200).json(user);
  });

  app.post('/users', express.json(), (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.sendStatus(400);
    }

    const user = {
      id: Date.now(),
      name,
    };

    users.push(user);

    return res.status(201).json(user);
  });

  app.delete('/users/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).send('Invalid id');
    }

    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.sendStatus(404);
    }

    users = users.filter((u) => u.id !== id);

    return res.sendStatus(204);
  });

  app.patch('/users/:id', express.json(), (req, res) => {
    const id = Number(req.params.id);

    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.sendStatus(404);
    }

    const { name } = req.body;

    if (!name) {
      return res.sendStatus(400);
    }

    const newUser = {
      id,
      name,
    };

    const index = users.findIndex((u) => u.id === id);

    users[index] = newUser;

    return res.status(200).json(newUser);
  });

  // #endregion

  // #region expenses methods

  app.get('/expenses', (req, res) => {
    let results = expenses;

    if (req.query.userId !== undefined) {
      const userId = Number(req.query.userId);

      if (isNaN(userId)) {
        return res.status(400).send();
      }
      results = results.filter((e) => e.userId === userId);
    }

    if (req.query.categories) {
      let categories = req.query.categories;

      if (typeof categories === 'string') {
        categories = [categories];
      }
      results = results.filter((e) => categories.includes(e.category));
    }

    if (req.query.from) {
      const from = new Date(req.query.from);

      if (isNaN(from.getTime())) {
        return res.status(400).send();
      }
      results = results.filter((e) => new Date(e.spentAt) >= from);
    }

    if (req.query.to) {
      const to = new Date(req.query.to);

      if (isNaN(to.getTime())) {
        return res.status(400).send();
      }
      results = results.filter((e) => new Date(e.spentAt) <= to);
    }

    return res.status(200).json(results);
  });

  app.post('/expenses', express.json(), (req, res) => {
    const { userId, spentAt, title, amount, category, note } = req.body;

    if (
      userId === undefined ||
      !spentAt ||
      !title ||
      amount === undefined ||
      !category ||
      !note
    ) {
      return res.sendStatus(400);
    }

    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.sendStatus(400);
    }

    const newExpense = {
      id: Date.now(),
      userId,
      spentAt,
      title,
      amount,
      category,
      note,
    };

    expenses.push(newExpense);

    return res.status(201).json(newExpense);
  });

  app.get('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.sendStatus(400);
    }

    const expense = expenses.find((e) => e.id === id);

    if (!expense) {
      return res.sendStatus(404);
    }

    return res.status(200).json(expense);
  });

  app.delete('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).send('Invalid id');
    }

    const expense = expenses.find((u) => u.id === id);

    if (!expense) {
      return res.sendStatus(404);
    }

    expenses = expenses.filter((u) => u.id !== id);

    return res.sendStatus(204);
  });

  app.patch('/expenses/:id', express.json(), (req, res) => {
    const id = Number(req.params.id);

    const expense = expenses.find((u) => u.id === id);

    if (!expense) {
      return res.sendStatus(404);
    }

    const { userId, spentAt, title, amount, category, note } = req.body;

    if (userId !== undefined) {
      const user = users.find((u) => u.id === userId);

      if (!user) {
        return res.sendStatus(400);
      }
      expense.userId = userId;
    }

    if (spentAt !== undefined) {
      expense.spentAt = spentAt;
    }

    if (title !== undefined) {
      expense.title = title;
    }

    if (amount !== undefined) {
      expense.amount = amount;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (note !== undefined) {
      expense.note = note;
    }

    return res.status(200).json(expense);
  });

  // #endregion
  return app;
}

module.exports = {
  createServer,
};
