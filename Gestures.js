/*
Copyright 2021 Mircerlancerous - https://github.com/mircerlancerous/Gestures

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var Gestures = new function(){
	var Types = {
		All: 0,
		SwipeLeft: 1,
		SwipeRight: 2,
		SwipeUp: 3,
		SwipeDown: 4,
		Down: 5,
		Up: 6,
		Tap: 7, Click: 7,
		Hold: 8, Context: 8, LongClick: 8,		//long hold then release or mouse right click
		Holding: 9,								//long hold - fires before release
		Move: 10, Live: 10						//returns live positions
	};
	
	function TypeInvalid(type){
		try{
			let num = parseInt(type);
			if(isNaN(num) || num < 0 || num > 10){
				return true;
			}
		}
		catch(e){
			return true;
		}
		return false;
	}
	
	function enableElementListeners(elm){
		elm.addEventListener("contextmenu", contextMenu, false);
		elm.addEventListener("pointerup", pointerUp, false);
		elm.addEventListener("pointerleave", pointerUp, false);
		elm.addEventListener("pointercancel", pointerUp, false);
		elm.addEventListener("pointerdown", pointerDown, false);
		elm.addEventListener("pointermove", pointerMove, false);
	}
	
	function removeElementListeners(elm){
		if(!elm){
			return;
		}
		elm.removeEventListener("contextmenu", contextMenu, false);
		elm.removeEventListener("pointerup", pointerUp, false);
		elm.removeEventListener("pointerleave", pointerUp, false);
		elm.removeEventListener("pointercancel", pointerUp, false);
		elm.removeEventListener("pointerdown", pointerDown, false);
		elm.removeEventListener("pointermove", pointerMove, false);
	}
	
	function addElement(elm, callback, type){
		let obj = {
			type: type,
			callback: callback,
		};
		let isNew = false;
		let data = findElementData(elm);
		if(data == null){
			isNew = true;
			data = {
				elm: elm,
				types: [obj]
			};
			elmList.push(data);
		}
		else{
			data.types.push(obj);
		}
		return isNew;
	}
	
	function findElementData(elm){
		for(let i=0; i<elmList.length; i++){
			//if this element no longer exists, auto clean-up
			if(!elmList[i].elm){
				elmList.splice(i,1);
				i--;
				continue;
			}
			//this is the element we're looking for
			if(elm == elmList[i].elm){
				return elmList[i];
			}
		}
		return null;	//should only get here when adding a new element
	}
	
	function doCallback(elm, obj){
		let i, data = findElementData(elm);
		for(i=0; i<data.types.length; i++){
			if(data.types[i].type == Types.All || data.types[i].type == obj.type){
				obj.elm = elm;
				data.types[i].callback(obj);
				break;
			}
		}
	}
	
	function reset(){
		LastMove.x = 0;
		LastMove.y = 0;
		LastMove.count = 0;
		
		Down.time = null;
		clearTimeout(Down.timer);
	}
	
	function onDownTimeout(){
		let reference = Down;
		if(LastMove.count > 0){
			reference = LastMove;
		}
		let obj = {
			type: Types.Holding,
			x: reference.x,
			y: reference.y
		};
		doCallback(Down.elm, obj);
	}
	
	var elmList = [];
	
	var Down = {
		elm: null,
		x: 0,
		y: 0,
		time: null,
		timer: null
	};
	
	var LastMove = {
		x: 0,
		y: 0,
		count: 0		//number of moves in this pointer session
	};
	
	var Config = {
		MaxTapMoves: 5,				//max number of move events to still count as a tap or hold
		MinSwipeLength: 30,			//px
		MinLongTouchTime: 500		//ms
	};
	
	/***********************************************************************/
	
	return {
		Types: Types,
		
		//type is optional
		addListener: function(elm, callback, type){
			if(TypeInvalid(type)){
				type = Types.All;
			}
			let newElement = addElement(elm, callback, type);
			if(newElement){
				enableElementListeners(elm);
			}
		},
		
		removeListener: function(elm, type){
			for(let i=0; i<elmList.length; i++){
				//if no element is passed, delete all
				if(!elm || elm == elmList[i].elm){
					if(typeof(type) === 'undefined'){
						//completely remove the listeners for the element
						removeElementListeners(elm);
						elmList.splice(i,1);
					}
					else{
						//remove just the callback for the type
						
					}
				}
			}
		}
	};
	
	/***********************************************************************/
	
	function stopDefaults(e){
		e.preventDefault();
		e.stopPropagation();
	}
	
	function contextMenu(e){
		e.preventDefault();
	}
	
	function pointerUp(e){
		stopDefaults(e);
		if(Down.time == null){
			return;
		}
		
		let obj = {
			type: Types.Up,
			x: e.pageX,
			y: e.pageY
		};
		doCallback(this, obj);
		
		let leave = false;
		//if the pointer has left the element
		if(e.type == "pointerleave" || e.type == "pointercancel"){
			leave = true;
		}
		
		let wasSwipe = false;
		//check first if this was a swipe - must be faster than hold
		if(Date.now() - Down.time < Config.MinLongTouchTime){
			let changeX = obj.x - Down.x;
			let changeY = obj.y - Down.y;
			let negativeX = false, negativeY = false;
			if(changeX < 0){
				changeX *= -1;
				negativeX = true;
			}
			if(changeY < 0){
				changeY *= -1;
				negativeY = true;
			}
			if(changeX >= changeY){
				if(leave || changeX >= Config.MinSwipeLength){
					//if left
					if(negativeX){
						obj.type = Types.SwipeLeft;
					}
					//if right
					else{
						obj.type = Types.SwipeRight;
					}
					doCallback(this, obj);
					wasSwipe = true;
				}
			}
			else{
				if(leave || changeY >= Config.MinSwipeLength){
					//if up
					if(negativeY){
						obj.type = Types.SwipeUp;
					}
					//if down
					else{
						obj.type = Types.SwipeDown;
					}
					doCallback(this, obj);
					wasSwipe = true;
				}
			}
		}
		
		//check if this was a tap or hold
		if(!wasSwipe && !leave && LastMove.count <= Config.MaxTapMoves){
			if(Date.now() - Down.time > Config.MinLongTouchTime){
				obj.type = Types.LongClick;
			}
			else{
				obj.type = Types.Tap;
			}
			doCallback(this, obj);
		}
		
		reset();
	}
	
	function pointerDown(e){
		stopDefaults(e);
		//don't support multitouch
		if(Down.time != null){
			return;
		}
		
		Down.time = Date.now();
		Down.x = e.pageX;
		Down.y = e.pageY;
		Down.elm = this;
		//start the timer for the 'holding' event
		Down.timer = setTimeout(onDownTimeout, Config.MinLongTouchTime);
		
		LastMove.x = Down.x;
		LastMove.y = Down.y;
		
		let obj = {
			type: Types.Down,
			x: e.pageX,
			y: e.pageY
		};
		
		doCallback(this, obj)
		
		//Check if this is a right-click
		if(e.button == 2){
			//Fire a hold event
			obj.type = Types.LongClick;
			doCallback(this, obj)
			reset();
		}
	}
	
	function pointerMove(e){
		stopDefaults(e);
		if(Down.time == null){
			return;
		}
		
		if(LastMove.x == e.pageX && LastMove.y == e.pageY){
			return;
		}
		LastMove.x = e.pageX;
		LastMove.y = e.pageY;
		LastMove.count++;
		
		let obj = {
			type: Types.Move,
			x: e.pageX,
			y: e.pageY
		};
		doCallback(this, obj)
	}
};
