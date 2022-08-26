# silux
A [sibilisp](https://github.com/urbandrone/sibilisp) based frontend framework and implementation of the flux architecture. Uses [snabbdom](https://github.com/snabbdom/snabbdom) as virtual DOM library.


```lisp
;;;; Counter implementation
(use "silux"
  silux-store
  silux-connect)

(include "silux/macros")
(import-namespace silux)

(defsum signal ((:init new-count)
                (:modify amount)))

(defun update (count sign)
  (if (.is signal sign)
      (match-sum sign ((:init (new-count)
                        new-count)
                       (:modify (amount)
                        (+ count amount))))
      count))

(defun view ({state} emit)
  ($div (:class "counter")
    ($h1 (:class "counter_count")
      (or (and (number? state) state)
          ""))
    ($div (:class "counter_buttons")
      ($button (:class "counter_buttons_decr"
                :type "button"
                :onclick (#> (emit (signal.modify -1))))
        "- 1")
      ($button (:class "counter_buttons_incr"
                :type "button"
                :onclick (#> (emit (signal.modify +1))))
        "+ 1"))))

(defvar *run-app*
        (silux-connect
          (silux-store (nil) update)
          (hash :el (.query-selector document "#counter")
                :view view)))

(call *run-app* (signal.init 0))
```


