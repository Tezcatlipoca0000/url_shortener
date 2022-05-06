require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongo_uri = process.env.MONGO_URI;
const mongoose = require('mongoose');
const mongo_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const Schema = mongoose.Schema;

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(mongo_uri, mongo_options)
  .then(
      () => console.log('connection successful'),
      err => console.log('connecting error', err)
    );

mongoose.connection.on('error', err => console.log('connection error', err));

const regSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: Number
});

const Reg = mongoose.model('Reg', regSchema); 

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  
  /*
  console.log('1',req.body);
  console.log('2',req.params);
  console.log('3',req.query);
  console.log('4',req.params.id);

  let queries = /\/\?/g;

  dns.lookup('https://url-shortener-microservice.freecodecamp.rocks/?v=1651849298942', (err, add, fam) => {
    console.log('test1: https://url-shortener-microservice.freecodecamp.rocks/?v=1651849298942')
    err ? console.log('err0r') : console.log('add&fam', add, fam)
  });

  dns.lookup('url-shortener-microservice.freecodecamp.rocks/?v=1651849298942', (err, add, fam) => {
    console.log('test2: url-shortener-microservice.freecodecamp.rocks/?v=1651849298942')
    err ? console.log('err0r') : console.log('add&fam', add, fam)
  });

  dns.lookup('url-shortener-microservice.freecodecamp.rocks', (err, add, fam) => {
    console.log('test3: url-shortener-microservice.freecodecamp.rocks')
    err ? console.log('err0r') : console.log('add&fam', add, fam)
  });

  dns.lookup('url-shortener-microservice.freecodecamp.rocks/', (err, add, fam) => {
    console.log('test4: url-shortener-microservice.freecodecamp.rocks/')
    err ? console.log('err0r') : console.log('add&fam', add, fam)
  });

  dns.lookup('https://url-shortener-microservice.freecodecamp.rocks', (err, add, fam) => {
    console.log('test5: https://url-shortener-microservice.freecodecamp.rocks')
    err ? console.log('err0r') : console.log('add&fam', add, fam)
  });

  res.json({'test': 'testing'});
  */

  let input_url = req.body.url,
    prot = /https*:\/\//,
    //web = /www\./,
    queries = /\/\?/,
    formated_url = input_url,
    short,
    response;

  if (prot.test(formated_url)) formated_url = formated_url.replace(prot, '');
  //if (web.test(formated_url)) formated_url = formated_url.replace(web, '');
  if (queries.test(formated_url)) formated_url = formated_url.slice(0, formated_url.search(queries));
  if (formated_url.charAt((formated_url.length)-1) === '/') formated_url = formated_url.slice(0, -1);

  console.log('url', input_url, formated_url, typeof formated_url);
  dns.lookup(formated_url, (err, add, fam) => {
    if (err) {
      console.log('lookup_error', err);
      res.json({error:'invalid url'});
    } else {
      console.log('url found add and fam', add, fam);
      (async () => {      
        short = (await Reg.estimatedDocumentCount()) + 1;
        response = {original_url: input_url, short_url: short};
        const reg = new Reg(response);
        reg.save((err, data) => {
          if (err) {
            console.log('error saving', err);
            res.json({error: 'error saving'});
          } else {
            console.log('save complete');
            res.json(response);
          }
        });   
      })();
    }
  }); 
});

app.get('/api/shorturl/:short?', (req, res) =>{
  let input = req.params.short,
    short = Number(input);
  console.log('looking for short>>>', input, short);
  Reg.find({short_url: short}, (err, data)=>{
    if (err) {
      console.log('looking error>>>>', err);
      res.json({error: 'No short URL found for the given input'});
    } else {
      console.log('no error looking...', data);
      res.redirect(data[0].original_url);
    }
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));


/* v1 

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongo_uri = process.env.MONGO_URI;
const mongoose = require('mongoose');
const mongo_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const Schema = mongoose.Schema;

// Basic Configuration
const port = process.env.PORT || 3000;

console.log('port', port, 'mongo_uri', mongo_uri);

mongoose.connect(mongo_uri, mongo_options)
  .then(
      () => console.log('connection successful'),
      err => console.log('connecting error', err)
    );

mongoose.connection.on('error', err => console.log('connection error', err));

const regSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: Number
});

const Reg = mongoose.model('Reg', regSchema); 

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  let url = req.body.url,
    short,
    valid = true,
    invalid = {error:'invalid url'},
    response;
  dns.lookup(url, (err) => {
    if (err) valid = false;
  });
  if (valid) {
    //db.push(reg);
    const createAndSaveRegistry = async (done) => {
      short = await Reg.estimatedDocumentCount();
      console.log('short', short);
      response = {original_url: url, short_url: short};
      const reg = new Reg(respons);
      reg.save((err, data) => {
        if (err) done(err);
        return done(null, data);
      });
    };
    console.log('reg', response);
    res.json(response);
  } else {
    res.json(invalid);
  }
});

app.get('/api/shorturl/:short?', (req, res) =>{
  let short = Number(req.params.short),
    url;
  //for (let i of db) {
  //  console.log('i', i, 'val', i.short_url, 'short', short, 'typeof short-val', typeof short, typeof i.short_url);
  //  if (i.short_url === short) url = i.original_url;
  //}
  //console.log('url', url, 'short', short);
  res.redirect(url);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

*/


/* v2

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongo_uri = process.env.MONGO_URI;
const mongoose = require('mongoose');
const mongo_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const Schema = mongoose.Schema;

// Basic Configuration
const port = process.env.PORT || 3000;

console.log('port', port, 'mongo_uri', mongo_uri);

mongoose.connect(mongo_uri, mongo_options)
  .then(
      () => console.log('connection successful'),
      err => console.log('connecting error', err)
    );

mongoose.connection.on('error', err => console.log('connection error', err));

const regSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: Number
});

const Reg = mongoose.model('Reg', regSchema); 

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  let url = req.body.url,
    short,
    valid = true,
    invalid = {error:'invalid url'},
    response;
  dns.lookup(url, (err, add, fam) => {
    if (err) valid = false;
  });
  if (valid) {
    //db.push(reg);
    // >>>>>> err done is not a function!!! 
    (async (done) => {
      short = await Reg.estimatedDocumentCount();
      console.log('short', short);
      response = {original_url: url, short_url: short};
      const reg = new Reg(response);
      reg.save((err, data) => {
        if (err) return done(err);
        return done(null, data);
      });
    })();
    console.log('reg', response);
    res.json(response);
  } else {
    res.json(invalid);
  }
});

app.get('/api/shorturl/:short?', (req, res) =>{
  let short = Number(req.params.short),
    url;
  //for (let i of db) {
  //  console.log('i', i, 'val', i.short_url, 'short', short, 'typeof short-val', typeof short, typeof i.short_url);
  //  if (i.short_url === short) url = i.original_url;
  //}
  //console.log('url', url, 'short', short);
  res.redirect(url);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
*/

/* v3 

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongo_uri = process.env.MONGO_URI;
const mongoose = require('mongoose');
const mongo_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const Schema = mongoose.Schema;

// Basic Configuration
const port = process.env.PORT || 3000;

console.log('port', port, 'mongo_uri', mongo_uri);

mongoose.connect(mongo_uri, mongo_options)
  .then(
      () => console.log('connection successful'),
      err => console.log('connecting error', err)
    );

mongoose.connection.on('error', err => console.log('connection error', err));

const regSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: Number
});

const Reg = mongoose.model('Reg', regSchema); 

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

let url,
  short,
  response;

const createAndSave = async (done) => {
  short = (await Reg.estimatedDocumentCount()) + 1;
  console.log('short', short);
  response = {original_url: url, short_url: short};
  console.log('response', response);
  const reg = new Reg(response);
  reg.save((err, data) => {
    if (err) return done(err);
    return done(null, data);
  });
};

app.post('/api/shorturl', (req, res) => {
  url = req.body.url
  let valid = true,
    invalid = {error:'invalid url'};
  dns.lookup(url, (err) => {
    if (err) valid = false;
  });
  if (valid) {
    //db.push(reg);
    createAndSave();
    console.log('reg', response);
    res.json(response);
  } else {
    res.json(invalid);
  }
});

app.get('/api/shorturl/:short?', (req, res) =>{
  let short = Number(req.params.short),
    url;
  //for (let i of db) {
  //  console.log('i', i, 'val', i.short_url, 'short', short, 'typeof short-val', typeof short, typeof i.short_url);
  //  if (i.short_url === short) url = i.original_url;
  //}
  //console.log('url', url, 'short', short);
  res.redirect(url);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

*/

/* v4

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongo_uri = process.env.MONGO_URI;
const mongoose = require('mongoose');
const mongo_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const Schema = mongoose.Schema;

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(mongo_uri, mongo_options)
  .then(
      () => console.log('connection successful'),
      err => console.log('connecting error', err)
    );

mongoose.connection.on('error', err => console.log('connection error', err));

const regSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: Number
});

const Reg = mongoose.model('Reg', regSchema); 

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

//const lookup_options = {
//  family: 0,
//  all: true
//};

app.post('/api/shorturl', (req, res) => {
  let url = req.body.url,
    short,
    invalid = {error:'invalid url'},
    response;
  console.log('url', url, typeof url);
  dns.lookup(url, (err, add, fam) => {
    if (err) {
      console.log('lookup_error', err);
      res.json(invalid);
    } else {
      console.log(add, fam);
      (async () => {
        short = (await Reg.estimatedDocumentCount()) + 1;
        response = {original_url: url, short_url: short};
        const reg = new Reg(response);
        reg.save((err, data) => {
          if (err) {
            console.log(err);
            res.json({error: 'error saving'});
          } else {
            res.json(response);
          }
        });
      })();
    }
  });
});

app.get('/api/shorturl/:short?', (req, res) =>{
  let short = Number(req.params.short);
  Reg.find({short_url: short}, (err, data)=>{
    if (err) console.log(err)
    res.redirect(data[0].original_url);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

*/

/* v5 

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongo_uri = process.env.MONGO_URI;
const mongoose = require('mongoose');
const mongo_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const Schema = mongoose.Schema;

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(mongo_uri, mongo_options)
  .then(
      () => console.log('connection successful'),
      err => console.log('connecting error', err)
    );

mongoose.connection.on('error', err => console.log('connection error', err));

const regSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: Number
});

const Reg = mongoose.model('Reg', regSchema); 

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

let x;

app.post('/api/shorturl', (req, res) => {
  let url = req.body.url,
    short,
    invalid = {error:'invalid url'},
    response,
    y;
  y = (url.indexOf('www')) + 4;
  url = url.slice(y, -1);
  console.log('url', url, typeof url);
  (async () => {
    x = await dns.lookup(url, (err, add, fam) => {
      if (err) {
        console.log('lookup_error', err);
        res.json(invalid);
      } else {
        console.log(add, fam);
        return add;
      }
    });
  })();
  console.log('x>>>>>>',x);
  (async () => {      
    short = (await Reg.estimatedDocumentCount()) + 1;
    response = {original_url: url, short_url: short};
    const reg = new Reg(response);
    reg.save((err, data) => {
      if (err) {
        console.log('error saving', err);
        res.json({error: 'error saving'});
      } else {
        res.json(response);
      }
    });   
  })();
});

app.get('/api/shorturl/:short?', (req, res) =>{
  let short = Number(req.params.short);
  Reg.find({short_url: short}, (err, data)=>{
    if (err) console.log(err)
    res.redirect(data[0].original_url);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

*/

/* v6 

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongo_uri = process.env.MONGO_URI;
const mongoose = require('mongoose');
const mongo_options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const Schema = mongoose.Schema;

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(mongo_uri, mongo_options)
  .then(
      () => console.log('connection successful'),
      err => console.log('connecting error', err)
    );

mongoose.connection.on('error', err => console.log('connection error', err));

const regSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: Number
});

const Reg = mongoose.model('Reg', regSchema); 

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  console.log('1',req.body);
  console.log('2',req.params);
  console.log('3',req.query);
  console.log('4',req.params.id);

  let queries = /\/\?/g;

  dns.lookup('https://url-shortener-microservice.freecodecamp.rocks/?v=1651849298942', (err, add, fam) => {
    console.log('test1: https://url-shortener-microservice.freecodecamp.rocks/?v=1651849298942')
    err ? console.log('err0r') : console.log('add&fam', add, fam)
  });

  dns.lookup('url-shortener-microservice.freecodecamp.rocks/?v=1651849298942', (err, add, fam) => {
    console.log('test2: url-shortener-microservice.freecodecamp.rocks/?v=1651849298942')
    err ? console.log('err0r') : console.log('add&fam', add, fam)
  });

  dns.lookup('url-shortener-microservice.freecodecamp.rocks', (err, add, fam) => {
    console.log('test3: url-shortener-microservice.freecodecamp.rocks')
    err ? console.log('err0r') : console.log('add&fam', add, fam)
  });

  dns.lookup('url-shortener-microservice.freecodecamp.rocks/', (err, add, fam) => {
    console.log('test4: url-shortener-microservice.freecodecamp.rocks/')
    err ? console.log('err0r') : console.log('add&fam', add, fam)
  });

  dns.lookup('https://url-shortener-microservice.freecodecamp.rocks', (err, add, fam) => {
    console.log('test5: https://url-shortener-microservice.freecodecamp.rocks')
    err ? console.log('err0r') : console.log('add&fam', add, fam)
  });



  res.json({'test': 'testing'});
//  let input_url = req.body.url,
//    prot = /https*:\/\//,
//    web = /www\./,
//    formated_url = input_url,
//    short,
//    response;

//  if (prot.test(formated_url)) formated_url = formated_url.replace(prot, '');
//  if (web.test(formated_url)) formated_url = formated_url.replace(web, '');
//  if (formated_url.charAt((formated_url.length)-1) === '/') formated_url = formated_url.slice(0, -1);

//  console.log('url', input_url, formated_url, typeof formated_url);
//  dns.lookup(formated_url, (err, add, fam) => {
//    if (err) {
//      console.log('lookup_error', err);
//      res.json({error:'invalid url'});
//    } else {
//      console.log('url found add and fam', add, fam);
//      (async () => {      
//        short = (await Reg.estimatedDocumentCount()) + 1;
//        response = {original_url: input_url, short_url: short};
//        const reg = new Reg(response);
//        reg.save((err, data) => {
//          if (err) {
//            console.log('error saving', err);
//            res.json({error: 'error saving'});
//          } else {
//            console.log('save complete');
//            res.json(response);
//          }
//        });   
//      })();
//    }
//  }); 
});

app.get('/api/shorturl/:short?', (req, res) =>{
  let input = req.params.short,
    short = Number(input);
  console.log('looking for short>>>', input, short);
  Reg.find({short_url: short}, (err, data)=>{
    if (err) {
      console.log('looking error>>>>', err);
      res.json({error: 'No short URL found for the given input'});
    } else {
      console.log('no error looking...', data);
      res.redirect(data[0].original_url);
    }
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

*/