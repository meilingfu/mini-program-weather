// pages/list/list.js
const dayMap = ['星期一','星期二', '星期三', '星期四', '星期五', '星期六','星期日']
Page({
  data:{
    weekWeather:[],
    city:'广州市'
  },
  onLoad(options){
    console.log(options.city)
    this.setData({
      city:options.city
    })
    this.getWeekWeather()
  },
  getWeekWeather(callback){
    wx.request({
      url:'https://test-miniprogram.com/api/weather/future',
      data:{
        time:new Date().getTime(),
        city:this.data.city
      },
      success:res=>{
        let result=res.data.result
        console.log(result)
        this.setWeekWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  setWeekWeather(result){
    let weekWeather=[]
    for (let i = 0; i < 7; i++) {
      let date = new Date()
      date.setDate(date.getDate()+i)
      weekWeather.push({
        day:dayMap[date.getDay()],
        date:`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`,
        temp: `${result[i].minTemp}°-${result[i].maxTemp}°`,
        iconPath:'/images/'+result[i].weather+'-icon.png'
      })
    }
    weekWeather[0].day='今天'
    this.setData({
      weekWeather:weekWeather
    })
  },
  onPullDownRefresh(){
    this.getWeekWeather(()=> {
      wx.stopPullDownRefresh()
    })
  }
})