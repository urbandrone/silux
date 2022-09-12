# silux
![NPM Downloads](https://img.shields.io/npm/dw/silux?color=343434&style=flat-square)
![NPM Version](https://img.shields.io/npm/v/silux?color=343434&style=flat-square)
![NPM License](https://img.shields.io/npm/l/silux?color=343434&style=flat-square)
![Sibilisp](https://img.shields.io/badge/build%20with-Sibilisp-000000?style=flat-square)

A [Sibilisp](https://github.com/urbandrone/sibilisp) based frontend framework and implementation of the Flux architecture, that uses [Snabbdom](https://github.com/snabbdom/snabbdom) as virtual DOM library. 

### TL;DR

Silux is...  
* ...a state management framework for frontend applications
* ...modular & extendable through a plugin architecture
* ...build with a small API surface
* ...equipped with special macros for VDOM creation
* ...lightweight (`5 KB` when gzipped)
* ...completely written in Sibilisp
* ...usable in Sibilisp, Sibilant and JavaScript

------

### Documentation

Have a look into the [📖 wiki](https://github.com/urbandrone/silux/wiki/Documentation)!

If you haven't used [Sibilisp](https://github.com/urbandrone/sibilisp) or [Sibilant](https://github.com/jbr/sibilant) before, check them out, both are really cool and fun. 😎

------

### Example

Showcases a basic counter implementation.

```lisp
(use "silux"
  silux-store
  silux-connect
  h)

(include "silux/vdom") ; Include the silux macros for an JSX like
(import-namespace silux) ; experience (see view function below)

(defsum signal ((:init new-state) ; Singals communicate a state change
                (:modify by-n)))                            

(defun update (state sign) ; A function to modify the current state
  (if (.is signal sign)
      (match-sum sign ((:init (new-state) ; Pattern match incoming signals
                        new-state)
                       (:modify (by-n)
                        (+ state by-n))))
      state))

(defun view ({state} emit) ; A function from state to VDOM
  ($div (:class "counter") ; Macro time! 😁
    ($h1 (:class "counter_count")
      (if (number? state) 
          state
          "-"))
    ($div (:class "counter_buttons")
      ($button (:class "counter_buttons_decr"
                :type "button"
                :onclick (#> (emit (signal.modify -1))))
        "- 1")
      ($button (:class "counter_buttons_incr"
                :type "button"
                :onclick (#> (emit (signal.modify +1))))
        "+ 1"))))

(defvar *run-app* ; *run-app* becomes the startup function
        (silux-connect ; Connects...
          (silux-store (nil) update) ; ...a store with no initial state...
          (hash :el (.query-selector document "#counter") ; ...to a DOM element...
                :view view))) ; ...and a VDOM creating function

(call *run-app* (signal.init 0)) ; Starts the app with an initial state of 0
```


