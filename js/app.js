var App;
//polyfill
if (typeof window.localStorage == 'undefined' || typeof window.sessionStorage == 'undefined') (function () {
	
	var Storage = function (type) {
		function createCookie(name, value, days) {
			var date, expires;
			
			if (days) {
				date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				expires = "; expires="+date.toGMTString();
			} else {
				expires = "";
			}
			document.cookie = name+"="+value+expires+"; path=/";
		}
		
		function readCookie(name) {
			var nameEQ = name + "=",
			ca = document.cookie.split(';'),
			i, c;
			
			for (i=0; i < ca.length; i++) {
				c = ca[i];
				while (c.charAt(0)==' ') {
					c = c.substring(1,c.length);
				}
				
				if (c.indexOf(nameEQ) == 0) {
					return c.substring(nameEQ.length,c.length);
				}
			}
			return null;
		}
		
		function setData(data) {
			data = JSON.stringify(data);
			if (type == 'session') {
				window.name = data;
			} else {
				createCookie('localStorage', data, 365);
			}
		}
		
		function clearData() {
			if (type == 'session') {
				window.name = '';
			} else {
				createCookie('localStorage', '', 365);
			}
		}
		
		function getData() {
			var data = type == 'session' ? window.name : readCookie('localStorage');
			return data ? JSON.parse(data) : {};
		}
		
		
  // initialise if there's already data
  var data = getData();
  
  return {
	length: 0,
	clear: function () {
		data = {};
		this.length = 0;
		clearData();
	},
	getItem: function (key) {
		return data[key] === undefined ? null : data[key];
	},
	key: function (i) {
	  // not perfect, but works
	  var ctr = 0;
	  for (var k in data) {
		if (ctr == i) return k;
		else ctr++;
	  }
	  return null;
	},
	removeItem: function (key) {
		delete data[key];
		this.length--;
		setData(data);
	},
	setItem: function (key, value) {
	  data[key] = value+''; // forces the value to a string
	  this.length++;
	  setData(data);
	}
};
};

if (typeof window.localStorage == 'undefined') window.localStorage = new Storage('local');
if (typeof window.sessionStorage == 'undefined') window.sessionStorage = new Storage('session');

})();

//custom binding

ko.bindingHandlers.store = {
	update: function(element, valueAccessor, allBindingsAccessor, data){
		var value = valueAccessor(), allBindings = allBindingsAccessor();
		var valueUnwrapped = ko.utils.unwrapObservable(value);
		var id = data.id();
		localStorage.setItem(id, ko.toJSON(data));
		App.store();
	}
};

//model
function Task(id, name, complete, completeYesterday){
	var self = this,
	_id = id,
	_today = App.newDate();
	self.id = ko.computed(function(){return _id;});
	self.name = ko.observable(name);
	self.complete = ko.observable(complete);
	self.completeYesterday = ko.observable(completeYesterday);

	//http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
	//todo: test this
	function validURL(str) {
	  var pattern = new RegExp('(http|ftp|https)://[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?');
	  if(!pattern.test(str)) {
		return false;
	  } else {
		return true;
	  }
	}

	self.isUrl = ko.computed(function(){return validURL(self.name());});

	self.toJSON = function(){
		return{
			Id: self.id(),
			Name: self.name(),
			Complete: self.complete(),
			CompleteYesterday: self.completeYesterday()
		};
	}
}

AppModel.prototype.toJSON = function(){
	var j = ko.toJS(this);
	return j;
}

function AppModel(taskList, listId){
	'use strict';
	var self = this,
	today = App.newDate(),
	yesterday = new Date(today);
	yesterday = new Date(yesterday.setDate(today.getDate() - 1));

	self.tasks = ko.observableArray([]);
	self.listDateMS = taskList !== null && taskList.listDateMS ? taskList.listDateMS : today.getTime();
	self.listDate = ko.computed(function(){
		return new Date(self.listDateMS);
	});
	self.yesterdayComplete = 0;
	self.previousTaskTotal = 0;

	if(self.listDate().toLocaleDateString() === today.toLocaleDateString()){
		//do nothing, continue
	} else if(self.listDate().toLocaleDateString() === yesterday.toLocaleDateString()){
		//set all tasks that are complete to complete yesterday
		if(taskList !== null && taskList.tasks.length > 0){
			$.each(taskList.tasks, function(key, value){
				value.CompleteYesterday = value.Complete;
				value.Complete = false;
			});
		}
	} else{
		//clear all complete and complete yesterday
		if(taskList !== null && taskList.tasks.length > 0){
			$.each(taskList.tasks, function(key, value){
				value.Complete = false;
				value.CompleteYesterday = false;
			});
		}
	}

	//change listDateMS to today
	self.listDateMS = today.getTime();

	if(taskList !== null && taskList.tasks.length > 0){
		$.each(taskList.tasks, function(key, value){
			var t = new Task(value.Id, value.Name, value.Complete, value.CompleteYesterday);
			self.previousTaskTotal++;
			if(value.CompleteYesterday){
				self.yesterdayComplete++;
			}
			self.tasks.push(t);
		});
	}

	self.allComplete = ko.computed(function(){
		var allDone = true;
		$.each(self.tasks(), function(key, value){
			if(value.complete() === false){
				allDone = false;
			}
		});
		return allDone;
	});

	self.tasksComplete = ko.computed(function(){
		var nDone = 0;
		$.each(self.tasks(), function(key, value){
			if(value.complete() === true){
				nDone++;
			}
		});
		return nDone + ' of ' + self.tasks().length + ' today'; 
	});

	self.tasksYesterday = ko.computed(function(){
		return self.yesterdayComplete + ' of ' + self.previousTaskTotal + ' yesterday';
	});

	function createId(){  
		return Math.random() * (1000000000000000 - 1) + 1;  
	} 

	self.addTask = function(){
		self.tasks.push(new Task(createId(), '', false, false));
	}

	self.removeTask = function(task) { self.tasks.remove(task); }

	self.store = function (){
		var json = self.toJSON();
		var jsonString = JSON.stringify(json);
		localStorage.setItem(listId, jsonString);
	}
}

(function($, undefined){
	'use strict';
	function AppViewModel(){
		var _model,
		_debug = false,
		self = this;
		return{
			log: function (msg){
				if(console && _debug){
					console.log(msg);
				}
			},
			init: function(listId){
				var taskList = window.localStorage.getItem(listId);
				var tasks = JSON.parse(taskList);
				_model = new AppModel(tasks, listId);
				ko.applyBindings(_model);
			},
			store: function(){
				_model.store();
			},
			status: function(){
				return ko.toJSON(_model);
			},
			newDate: function(){
				return new Date();
			},
			addTask: function(){
				_model.addTask();
				$('.task > input').last().focus();
			}
		};
	}
	App = new AppViewModel();
}(jQuery));