# Gestures
No frills Javascript Gestures library. Works the same for both touch and mouse input.

```
Gestures.addListener([element], [callback], [type *optional*]);
```

Types are enumerated at the top of the library; access with `Gestures.Types.All`.

```
{
  All: 0,
  SwipeLeft: 1,
  SwipeRight: 2,
  SwipeUp: 3,
  SwipeDown: 4,
  Down: 5,
  Up: 6,
  Tap: 7, Click: 7,
  Hold: 8, Context: 8, LongClick: 8,		//long hold then release or mouse right click
  Holding: 9,					//long hold - fires before release
  Move: 10, Live: 10				//returns live positions
}
```

Callback event object provides the page coordinates of the event.

```
{
  type: Types.Up,
  x: 155,
  y: 27,
  elm: {}
}
```
