const fs = require('fs');
const http = require('http');

let generateRandom = () => Math.floor(Math.random() * 10000000 + 1);

let getPhonebook = (req, res, data, matches) => {
    res.end(JSON.stringify(data));
}

let getContact = (req, res, data, matches) => {
    let id = matches[0];
    res.end(JSON.stringify(data[id]));
}

let deleteContact = (req, res, data, matches) => {
    let id = matches[0];
    delete data[id];
    fs.writeFile('phonebook.txt', JSON.stringify(data), 'utf8', (err) => {
        res.end(`Contact has been deleted.`);
    })
}

let readBody = (req, callback) => {
    let body="";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        callback(body);
    })
}

let addContact = (req, res, data, matches) => {
    readBody(req, (body) => {
        let newContact = JSON.parse(body);
        let id = generateRandom();
        newContact.id = id;
        data[id] = newContact;
        fs.writeFile('phonebook.txt', JSON.stringify(data), 'utf8', (err) => {
            res.end(`New contact has been created.`); 
        })
    })
}

let updateContact = (req, res, data, matches) => {
    readBody(req, (body) => {
        let currentContact = matches[0];
        let contactUpdates = JSON.parse(body);
        data[currentContact] = contactUpdates;
        fs.writeFile('phonebook.txt', JSON.stringify(data), 'utf8', (err) => {
            res.end(`${(JSON.stringify(data[currentContact]["name"]))} has been updated.`); 
        })
    })
}

let notFound = (req, res) => {
    res.end('404 Not Found');
}

let routes = [
    {
        method: 'GET',
        url: /^\/phonebook\/([0-9]+)$/,
        run: getContact
    },
    {
        method: 'DELETE',
        url: /^\/phonebook\/([0-9]+)$/,
        run: deleteContact
    },
    {
        method: 'PUT',
        url: /^\/phonebook\/([0-9]+)$/,
        run: updateContact
    },
    {
        method: 'GET',
        url: /^\/phonebook\/?$/,
        run: getPhonebook
    },
    {
        method: 'POST',
        url: /^\/phonebook\/?$/,
        run: addContact
    },
    {
        method: 'GET',
        url: /^.*$/,
        run: notFound
    }
]

//Everything inside of this function will be run anytime someone connects to your server
let server = http.createServer((req, res) => {
    fs.readFile('phonebook.txt', 'utf8', (err, data) => {
        for (route of routes) {
            if (route.url.test(req.url) && route.method === req.method) {
                let matches = route.url.exec(req.url);
                let contacts = JSON.parse(data);
                route.run(req, res, contacts, matches.slice(1));
                break
            }
        }
    })
})

server.listen(3102);