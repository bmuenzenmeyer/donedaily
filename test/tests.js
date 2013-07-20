module("AppModel");
test("testConstructor", function(){
	var taskList = {"tasks":[{"Id":47692718217150.33,"Name":"Hi","Complete":true,"Date":"Saturday, August 04, 2012"},{"Id":260405898792669.9,"Name":"Hello","Complete":true,"Date":"Saturday, August 04, 2012"},{"Id":93947011977435.06,"Name":"Goodbye","Complete":true,"Date":"Saturday, August 04, 2012"},{"Id":459356697974727.1,"Name":"Tag!","Complete":false,"Date":"Saturday, August 04, 2012"}],"yesterdayComplete":0,"previousTaskTotal":4,"allComplete":false,"tasksComplete":"3 of 4 today","tasksYesterday":"0 of 0 yesterday","date":"Saturday, August 04, 2012"}

	var a = new AppModel(taskList, 101010);

	equal(a.allComplete(), false, 'All Complete is false');
	equal(a.tasks().length, 4, 'All tasks created');
});
test("testMidnightCutover", function(){

	var taskList = {"tasks":[{"Id":47692718217150.33,"Name":"Hi","Complete":true,"Date":"Saturday, August 04, 2012"},{"Id":260405898792669.9,"Name":"Hello","Complete":true,"Date":"Saturday, August 04, 2012"},{"Id":93947011977435.06,"Name":"Goodbye","Complete":true,"Date":"Saturday, August 04, 2012"},{"Id":459356697974727.1,"Name":"Tag!","Complete":false,"Date":"Saturday, August 04, 2012"}],"yesterdayComplete":0,"previousTaskTotal":4,"allComplete":false,"tasksComplete":"3 of 4 today","tasksYesterday":"0 of 0 yesterday","date":"Saturday, August 04, 2012"}
	App.newDate = function(){
		var date = new Date(taskList.date);
		return new Date(date.setDate(date.getDate() + 1));
	};

	var a = new AppModel(taskList, 101010);

	equal(a.allComplete(), false, 'All Complete was true');
});

