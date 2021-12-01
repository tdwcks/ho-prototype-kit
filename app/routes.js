const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line
// 0.1 do you know the name of the CorT?

router.post('/search-route', function (req, res) {

  let entitytype = req.session.data['entity-type']

    if (entitytype == 'people') {
      req.app.locals.peopleSearch = ""
      req.app.locals.searchListNames = []
      req.app.locals.firstPageLoad = true

      res.redirect('/search-types/people-search')
    }
    else
    {
      if (entitytype == 'address') {
        req.app.locals.peopleSearch = ""
        req.app.locals.searchListNames = []
        req.app.locals.firstPageLoad = true

        res.redirect('/search-types/address-search')
      }
    }

})

// 1.0 Search


// Using lunr for the search but only works for whole words, cannot make it work with wildcards '*''

router.post('/search-for-people', function (req, res) {
  req.app.locals.firstPageLoad = false
  let searchList = []
  let searchListNames = []
  let peopleSearchValue = req.session.data['people-search-value']
  req.app.locals.peopleSearch = peopleSearchValue
  let documents = entitySearch.entitys_search
  //error if no value entered
  if (peopleSearchValue == "") {
    console.log('no data entered')
    req.app.locals.errorString = "Field is blank - please enter your search term"
    req.app.locals.errorFormClass = "govuk-form-group--error"
    req.app.locals.errorInputClass = "govuk-input--error"
    res.render('search-types/people-search')
  }
  else {
    req.app.locals.errorString = ""
    req.app.locals.errorFormClass = ""
    req.app.locals.errorInputClass = ""

// create lunr index and search fields
    let idx = lunr(function(){
      this.ref('slug')
      this.field('first_name')
      this.field('last_name')
      this.field('address')
      this.field('town_name')
      this.field('postcode')
      this.field('date_birth')
      this.field('age')
      this.field('sex')
      this.field('nationality')
      this.field('source')

      documents.forEach(function(doc) {
        this.add(doc)
      }, this)
    })
    // lunr ignores certain words and returns no results, so remove from the search term
    for (i = 0; i < lunrStopWords.lunrWords.length; i++) {
      let stopWord = lunrStopWords.lunrWords[i].toLowerCase()
      let searchValue = peopleSearchValue
      if (searchValue.includes(' ' + stopWord + ' ')) {
        peopleSearchValue = searchValue.replace(' ' + stopWord, '' )
        console.log('peopleSearchValue ' + peopleSearchValue)
      }
    }

    // if more than one term entered make them both required to narrow down the search

    if (peopleSearchValue !== null) {
      peopleSearchTerm = '+' + peopleSearchValue.trim().replace(/ /g, ' +')
      console.log('peopleSearchTerm ' + peopleSearchTerm)

        searchList = idx.search(peopleSearchTerm)

      if (searchList.length > 1) {
        req.app.locals.entityType = 'people'
      }
      else {
        req.app.locals.entityType = 'person'
      }
    }

    // loop through search results and add the terms to the searchlistnames
    for (let i=0 ; i < searchList.length; i++) {
      for (j=0; j < documents.length; j++) {
        if (searchList[i].ref == documents[j].slug) {
          let entityNameSlug = {
            name: documents[j].first_name + ' ' + documents[j].last_name,
            slug: documents[j].slug.toLowerCase(),
            date_birth: documents[j].date_birth,
            age: documents[j].age,
            sex: documents[j].sex,
            nationality: documents[j].nationality,
            source: documents[j].source,
          }
          searchListNames.push(entityNameSlug)
        }
      }
    }
    console.log(searchListNames);
    // make the list of slugs a global variable and sort at the same time
    req.app.locals.searchListNames = searchListNames.sort(function(a, b) {
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
    })

    res.render('search-types/people-search')
  }

})

// require(`./views/design-system/_routes.js`)(router)

module.exports = router
