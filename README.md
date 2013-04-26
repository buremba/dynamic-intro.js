# Dynamic-Intro.js

> This is an improved version of Intro.js optimized for single-page applications.

> Better introductions for websites and features with a step-by-step guide for your projects.


## How to use
Dynamic-Intro.js can be added to your site in three simple steps:

**1)** Include `intro.js` and `introjs.css` (or the minified version for production) in your page. 

> Note: if you need Internet Explorer compatiblity, you have to add introjs-ie.css to the page also:
  
```html
<!--[if lte IE 8]>
  <link href="../introjs-ie.css" rel="stylesheet">
<!-- <![endif]-->
````

**2)** This plugin only supports javascript constructor way to initialize the tutorial.

For example: 

**Example:**
```javascript
    introJs([{
            element: document.getElementById('div'),
            message: "Test 1",
            step: 1,
            load: function (self) { // when this step is called, it will execute this function
                if(someStatements)
                    return self.goToStep(2);
            }
        },
        {
            element: function() { return document.getElementById('div2') }, // yes, it supports functions as element attribute, if you need to make some changes is DOM before returning element object, you can use this feature. (This is a very handy feature for single-page applications.)
            message: 'You can click this icon to like songs, When you like a song, it will automatically added into your library.',
            position:'left',
            step: 2  
        }
    ]).start();
````

## Build

First you should install `nodejs` and `npm`, then first run this command: `npm install` to install all dependencies.

Now you can run this command to minify all static resources:

    make build


## Release History
 * **v0.4.0** - 2013-04-27
   - Created new branch to implement intro.js for single-page apps.
 * **v0.3.0** - 2013-03-28
   - Adding support for CommonJS, RequireJS AMD and Browser Globals.
   - Add `goToStep` function to go to specific step of introduction.
   - Add `onchange` callback.
   - Add `exit` function to exit from introduction.
   - Adding options with `setOption` and `setOptions` functions.
   - More IE compatibility.
   - Fix `min-width` bug with tooltip box.
   - Code cleanup + Better coding style.

 * **v0.2.1** - 2013-03-20
   - Fix keydown event unbinding bug.

 * **v0.2.0** - 2013-03-20
   - Ability to define tooltip position with `data-position` attribute
   - Add `onexit` and `oncomplete` callback
   - Better scrolling functionality
   - Redesign navigating buttons + add previous button
   - Fix overlay layer bug in wide monitors
   - Fix show element for elements with position `absolute` or `relative`
   - Add `enter` key for navigating in steps
   - Code refactoring
  
  
 * **v0.1.0** - 2013-03-16 
   - First commit. 

## Author
**Afshin Mehrabani** **Burak Emre Kabakcý**

## License
> Copyright (C) 2012 Afshin Mehrabani (afshin.meh@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions 
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
IN THE SOFTWARE.
