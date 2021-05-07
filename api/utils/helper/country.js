var Country = require('../../model/country');

// you can refer any other flow to get count or number of record
Country.countDocuments({}, function( err, count){

    // decide ur other logic

    // if count is 0 or less
    if(count <= 0) {

        var country = {
            name: 'Nigeria',
            isoCode: 'NG',
            states: [
                'Abia',
                'Adamawa',
                'Akwa Ibom',
                'Anambra',
                'Bauchi',
                'Bayelsa',
                'Benue',
                'Borno',
                'Cross River',
                'Delta',
                'Ebonyi', 
                'Edo',
                'Ekiti',
                'Enugu',
                'Federal Capital Territory',
                'Gombe',
                'Imo',
                'Jigawa',
                'Kaduna', 
                'Kano', 
                'Katsina', 
                'Kebbi',
                'Kogi', 
                'Kwara',
                'Lagos',
                'Nasarawa',
                'Niger',
                'Ogun', 
                'Ondo',
                'Osun',
                'Oyo', 
                'Plateau',
                'Rivers',
                'Sokoto',
                'Taraba',
                'Yobe',
                'Zamfara'],
            mecca: 'Lagos',
            currency: {
                name: 'Naira',
                abbr: 'NGN'
            },
            localOffset: '+01:00',
            ticketChargeRate: 8.5,
            costPerEmail: 0.5,
            costPerSms: 2.5,
            mailingListCostPerMail: 0.35,
            eventUpdateCostPerMail: 0.35,
            costPerFacebookPost: 5000, 
            costPerIntagramPost: 5000,
            costPerTwitterPost: 5000,
            costPerWhatsappPost: 5000,
            featuredEventCostPerDay: 300,
        }

        Country.create(country, function(e) {
            if (e) {
                throw e;
            }
        });
    }

})