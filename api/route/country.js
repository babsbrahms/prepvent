const express = require('express')
const router = express.Router();
const moment = require('moment');

const Country = require('../model/country')


// add country

// [X] get contries
router.get('/get_countries', (req, res) => {
    Country.distinct('name')
    .then((countries) => {  
        res.status(200).json({ countries }) 
    })
    .catch(err => res.status(400).json({ msg: err.message }))
})

// [X] get country details
router.get('/get_country_details/:name', (req, res) => {
    const { name } = req.params;
    
    Country.findOne({ name: name })
    .then((country) => {
        if (country) {
            res.status(200).json({ details: country }) 
        } else {
            res.json({ error: 'Country not found' })
        }
    })
    .catch(err => res.status(400).json({ msg: err.message }))
})

module.exports = router;