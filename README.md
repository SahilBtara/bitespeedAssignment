***Published the endpoint on https://bitespeedassignment-hzf3.onrender.com/identify***

1. Onboarding a new contact

Sample request
```
{ 
	"email": "sahil@bitespeed.com", 
	"phonenumber": "123456789" 
}
```

Sample response
```
{ 
    "contact": 
		{ 
        "primaryContactId": 8, 
        "emails": [ 
            "sahil@bitespeed.com" 
        ], 
        "phoneNumbers": [ 
            "123456789" 
        ], 
        "secondaryContactId": [] 
    } 
}
```

2. Create a secondary contact

With the same email

Sample request 
```
{ 
    "email": "sahil@bitespeed.com",
    "phonenumber": "987654321" 
}
```

Sample response
```
{
    "contact": {
        "primaryContactId": 8,
        "emails": [
            "sahil@bitespeed.com"
        ],
        "phoneNumbers": [
            "123456789",
            "987654321"
        ],
        "secondaryContactId": [
            9
        ]
    }
}
```

With the same phonenumber

Sample request 
```
{ 
    "email": "sahil2@bitespeed.com",
    "phonenumber": "987654321" 
}
```

Sample response
```
{
    "contact": {
        "primaryContactId": 8,
        "emails": [
            "sahil@bitespeed.com",
            "sahil2@bitespeed.com"
        ],
        "phoneNumbers": [
            "123456789",
            "987654321"
        ],
        "secondaryContactId": [
            9,
            10
        ]
    }
}
```

3. Convert a secondary to primary

Create a new primary

Sample request 
```
{ 
    "email": "sahil3@bitespeed.com",
    "phonenumber": "9999999" 
}
```

Sample response
```
{
    "contact": {
        "primaryContactId": 11,
        "emails": [
            "sahil3@bitespeed.com"
        ],
        "phoneNumbers": [
            "9999999"
        ],
        "secondaryContactId": []
    }
}
```

Convert this new entry to secondary

Sample request 
```
{ 
    "email": "sahil@bitespeed.com",
    "phonenumber": "9999999" 
}
```

Sample response
```
{
    "contact": {
        "primaryContactId": 8,
        "emails": [
            "sahil@bitespeed.com",
            "sahil2@bitespeed.com",
            "sahil3@bitespeed.com"
        ],
        "phoneNumbers": [
            "123456789",
            "987654321",
            "9999999"
        ],
        "secondaryContactId": [
            9,
            10,
            11
        ]
    }
}
```

