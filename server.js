const express = require('express') 
const logger = require('morgan')
const errorhandler = require('errorhandler')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/edx-course-db')

let app = express()
app.use(bodyParser.json())
app.use(logger('dev'))
app.use(errorhandler())

const Account = mongoose.model('Account', {
    name: String,
    balance: Number
})

app.get('/accounts', (req, res, next) => {
    // sort new account first
    Account.find({}, null, {sort: {_id: -1}}, (err, accounts) => {
        if (err) return next(err)
        res.send(accounts)
    })
})

// check parameter id middleware
app.param('id', (req, res, next) => {
    Account.findById(req.params.id, (err, account) => {
        if (err || !account) res.status(400).send({
            error: 'Please use a valide id.'
        })
        req.account = account
        next()
    })
})

app.get('/accounts/:id', (req, res) => {
    res.send(req.account)
})

app.post('/accounts', (req, res, next) => {
    if (req.body.name && req.body.balance) {
        let newAcount = new Account({
            name: req.body.name,
            balance: req.body.balance
        })
        newAcount.save((err, results) => {
            if (err) return next(err)
            res.send(results)
        })
    } else {
        return res.status(400).send({
            error: 'Please post a complete account.'
        })
    }
})

app.put('/accounts/:id', (req, res, next) => {
    if (req.body.name) req.account.name = req.body.name
    if (req.body.balance) req.account.balance = req.body.balance
    req.account.save((err, results) => {
        if (err) return next(err)
        res.send(results)
    })
})

app.delete('/accounts/:id', (req, res, next) => {
    req.account.remove((err, results) => {
        if (err) return next(err)
        res.send(results)
    })
})

app.listen(3000)