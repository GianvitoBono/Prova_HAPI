const Hapi = require('hapi');

// Init server
const server = new Hapi.Server();

//Connessione a MongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hapidb', { useMongoClient: true })
        .then(() => console.log('Connesso al DB'))
        .catch(err => console.error(err));

//Creazione Modello Task
const Task = mongoose.model('Task', {text: String});

// Aggiunta connessione
server.connection({
  port: 8080,
  host: 'localhost'
});

// Definizione Routes
//Home Route
server.route({
  method: "GET",
  path: "/",
  handler: (request, reply) => {
    reply.view('index', {
      name: 'Gianvito Bono'
    });
  }
});

// Route dinamica
server.route({
  method: "GET",
  path: "/user/{name}",
  handler: (request, reply) => {
    reply('Hellow, ' + request.params.name);
  }
});

//  GET Tasks Route
server.route({
  method: "GET",
  path: "/tasks",
  handler: (request, reply) => {
    let tasks = Task.find((err, tasks) => {
      reply.view('tasks', {
        tasks: tasks
      });
    });
    /*
    reply.view('tasks', {
      tasks: [
        {text: 'Task Uno'},
        {text: 'Task Due'},
        {text: 'Task Tre'}
      ]
    });
    */
  }
});

// POST Task Route
server.route({
  method:'POST',
  path: '/tasks',
  handler: (request, reply) => {
    let text = request.payload.text;
    let newTask = new Task({text: text});
    newTask.save((err, task) => {
      if(err) return console.log(err);
      return reply.redirect().location('tasks');
    });
  }
});

// Route Statiche
server.register(require('inert'), (err) => {
  if(err) {
    throw err;
  }
  server.route({
    method: 'GET',
    path: '/about',
    handler: (request, reply) => {
      reply.file('./public/about.html');
    }
  });
});

// Vision Templates
server.register(require('vision'), (err) => {
  if(err) throw err;

  server.views({
    engines: {
      html: require('handlebars')
    },
    path: __dirname + '/views'
  });
});

// Avvio server
server.start((err) => {
  if(err) {
    throw err;
  }
  console.log('Server avviato sulla porta: 8000');
});
