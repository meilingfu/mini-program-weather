const weatherMap={
  'sunny':'晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap={
  'sunny':'#cdeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const QQMapWX=require('../../libs/qqmap-wx-jssdk.js')
const UNPROMPTED = 0
const UNAUTHORIZED = 1
const UNPROMPTED_TIPS = '点击获取当前位置'
const UNAUTHORIZED_TIPS = '点击开启位置权限'

Page({
  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    console.log(temp, weather)
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBg: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather]
    })
  },
  setHourlyWeather(result){
    //set forecast
    console.log(result.forecast)
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i++) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result){
    let date=new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}°-${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather(){
    wx.navigateTo({
      url: '/pages/list/list?city='+this.data.city,
    })
  },
  onTapLocation() {
    if(this.data.locationAuthType===UNAUTHORIZED)
      wx.openSetting({
        success:res=>{
          console.log(res)
          let auth=res.authSetting['scope.userLocation']
          if(auth){
            this.getCityAndWeather()
          }
        }
      })
    else
      this.getCityAndWeather()
  },
  getCityAndWeather(){
    wx.getLocation({
      success: res => {
        console.log(res.latitude, res.longitude)
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            console.log(city)
            this.setData({
              city: city,
              number: 0
            })
            this.getNow()
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType:UNAUTHORIZED,
          tipText:UNAUTHORIZED_TIPS
        })
      }
    })
  },
  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      success: res => {
        console.log(res)
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete:()=>{
        callback && callback()
      }
    })
  },
  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },
  onLoad(){
    this.qqmapsdk=new QQMapWX({
      key:'5SKBZ-B53WP-VCXDA-V4GAD-RBQSH-X7FEB'
    })
    wx.getSetting({
      success:res=>{
        let auth=res.authSetting['scope.userLocation']
        console.log(auth)
        this.setData({
          locationAuthType:(auth===false)?UNAUTHORIZED:UNPROMPTED,
          tipText:(auth===false)?UNAUTHORIZED_TIPS:UNPROMPTED_TIPS
        })
        if(auth)
          this.getCityAndWeather()
        else
          this.getNow()
      }
    })
  },
  data:{
    nowTemp:'14°',
    nowWeather:'晴天',
    nowWeatherBg:'',
    hourlyWeather:[],
    todayDate:' ',
    todayTemp:' ',
    city:'广州市',
    number:0.5,
    locationAuthType:UNPROMPTED,
    tipText:UNPROMPTED_TIPS
  }
})