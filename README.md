# Hapi-todo

A simple todo app built with Hapi.js and Angular.

WIP

## Motivation

I did this to get an idea of what idiomatic Hapi.js would look like, written in TypeScript.
This isn't meant to be used for anything other than learning.

## Design

### Backend

 - There is a repo, which does the SQL stuff. It emulates boolean logic by using 0 and 1 in Sqlite.
 - A very simple service layer which basically just relays things to the database.
 - Tests all around. The service layer tests mocks the underlying repo.
 - Trying to keep the number of anonymous functions to a minimum.

## Dependencies

- TypeScript
- Hapi.js
- Sqlite (the repo)
- Angular
- Jest
