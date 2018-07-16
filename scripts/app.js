
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    isEducationOpen: true,
    isExperienceOpen: true,
    isSkillsOpen: true,
    isProjectsOpen: true
  },

  methods: {
  	gotoEducations: function (){
  		this.smoothScrollToElement("Educations");
  	},
  	gotoAboutMe: function(){
  		this.smoothScrollToElement("aboutMe");
  	},
  	gotoSkills: function(){
  		this.smoothScrollToElement("Skills");
  	},
  	gotoExperiences: function(){
      this.smoothScrollToElement("Experiences");
    },
    slideEducations: function(){
      this.slide(this.isEducationOpen, "educationDetails");
      this.isEducationOpen = !this.isEducationOpen;
    },
    slideExperiences: function(){
      this.slide(this.isExperienceOpen, "experienceDetails");
      this.isExperienceOpen = !this.isExperienceOpen;
    },
    slideSkills: function(){
      this.slide(this.isSkillsOpen, "skillsDetails");
      this.isSkillsOpen = !this.isSkillsOpen;
    },
    gotoTop: function(){
      $(document).scrollTop(0);
    },
    smoothScrollToElement: function (elementId){
      var offset = $("#" + elementId).offset();
      $("html,body").animate({scrollTop: offset.top},1000);
    },
    slide: function(show,elementId){
      if(show)
        $("#"+elementId).slideUp();
      else
        $("#"+elementId).slideDown();
    }
  }
})
$(document).ready(function(){
    setTimeout(function(){
        $(".loader").css("display","none");
        $(".overlay").css("display","none");
        $("#app").css("display","block");
        $(document).scrollTop(0);
    },3000);
});
// create a bar chart for skills in percentage
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["ASP.NET MVC", "Web API", "MSSQL", "EF6", "HTML5", "CSS3","Patterns","Javascript","JQuery","VueJS","AngularJS","Kendo UI"],
        datasets: [{
            label: '% of skill in the topics',
            data: [80, 75, 60, 65, 90, 62,20,60,78,60,76,80],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            
            yAxes: [{
            ticks: {
            
                   min: 0,
                   max: 100,
                   callback: function(value){return value+ "%"}
                },  
								scaleLabel: {
                   display: true,
                   labelString: "Percentage"
                }
            }]
        }
    }
});