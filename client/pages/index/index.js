var Charts = require('../../utils/wxcharts.js')
var config = require('../../config.js')
var app = getApp();
var chartArray = [{
  value: 1,
  name: '事件1'
}, {
  value: 2,
  name: '事件2'
}, {
  value: 3,
  name: '事件3'
}]

var menu = [
  {
    id: 0,
    title: '首页'
  },
  {
    id: 1,
    title: '数据报表'
  },
  {
    id: 2,
    title: '系统设置'
  },
  {
    id: 3,
    title: '安全基线'
  },
  {
    id: 4,
    title: '防病毒'
  },
  {
    id: 5,
    title: '数据防泄露'
  },
  {
    id: 6,
    title: '系统维护'
  },
  {
    id: 7,
    title: '更新策略'
  }
]

Page({
  data: {
    chartIndex: 0,
    chartArray: chartArray,
    chartData: {},
    chartWidth: 0,
    chartHeight: 0,
    newEventsList: [],
    chartReady: false,
    eventReady: false,
    timeType: 1, //1-一个月 2-半年 3-一年
    timeTitle: ['', '30 天', '半 年', '一 年'],
    ballOpacity: 0.7,
    ballBottom: 20,
    ballRight: 30,
    scrollable: true,
    showShadow: 'none',
    showCanvas: 'block',
    animationData: {},
    nickName: '',
    avatarUrl: '',
    currentMenuItem: 0,
    menu: menu
  },
  onLoad: function () {
    var res = wx.getSystemInfoSync()
    let chartWidth = res.windowWidth - 20
    let chartHeight = res.windowHeight / 3
    let screenWidth = res.windowWidth
    let screenHeight = res.windowHeight
    this.setData({
      chartWidth,
      chartHeight,
      screenWidth,
      screenHeight
    })

    var that = this
    //res = app.getUserInfo()
    app.getUserInfo(function (res) {
      console.log('app.getUserInfo', res)
      that.setData({
        nickName: res.nickName,
        avatarUrl: res.avatarUrl
      })
    })

    this.getChartData()
    this.getNewEvents()
  },
  onShow: function () {
    var animation = wx.createAnimation({
      duration: 0
    })
    animation.translateX("-100%").step()
    this.setData({
      animationData: animation.export()
    })
  },
  onReady() {
    //this.slideUp()
  },
  loadChart: function () {
    console.log("loadChart:")
    let result = this.formatChartData()
    var chartWidth = this.data.chartWidth
    var chartHeight = this.data.chartHeight
    new Charts({
      canvasId: 'chart-canvas',
      background: '#1A1A1A',
      legend: false,
      type: 'area',
      categories: result.date,//横坐标
      animation: true,
      dataLabel: false,
      series: [{
        name: '日期',
        data: result.count, //纵坐标
        color: '#3a76d0'
      }],
      yAxis: {
        min: 0,
        fontColor: '#808080',
        gridColor: '#808080',
        format: function (val) {
          return val
        },
      },
      xAxis: {
        fontColor: '#808080',
        gridColor: '#808080'
      },
      extra: {
        lineStyle: 'curve'
      },
      width: chartWidth,
      height: chartHeight
    })
    this.setData({
      chartReady: true
    })
  },
  getChartData() {
    console.log('getChartData')
    let that = this
    let chartID = this.data.chartArray[this.data.chartIndex].value
    let timeType = this.data.timeType
    wx.request({
      url: config.service.getChartData + '/?type=' + timeType + '&id=' + chartID,
      method: 'GET',
      success: function (res) {
        let chartData = res.data.data
        console.log(chartData)
        that.setData({
          chartData
        })
        that.loadChart()
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  getNewEvents() {
    console.log('getNewEvent')

    let that = this
    wx.request({
      url: config.service.getNewEvents + '/custom/EventsInfoNews',
      method: 'GET',
      success: function (res) {
        let newEventsList = res.data.data
        that.setData({
          newEventsList,
          eventReady: true
        })
        console.log(newEventsList)
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  formatChartData() {
    console.log('formatChartData:')
    let result = {
      date: [],
      count: []
    }
    let chartData = this.data.chartData
    for (let i = 0; i < chartData['sequence'].length; i++) {
      result.date[i] = chartData['sequence'][i].date
      result.count[i] = chartData['sequence'][i].count
    }
    if (result.date[0] == undefined) {
      result = {
        date: [1, 2, 3, 4, 5],
        count: [0, 0, 0, 0, 0]
      }
    }
    return result
  },
  refreshEvent() {
    this.setData({
      newEventsList: [],
      eventReady: false
    })
    this.getNewEvents()
  },
  changeChart(e) {
    let chartIndex = e.detail.value;
    this.setData({
      chartIndex,
      chartData: {},
      chartReady: false
    })
    this.getChartData()
  },
  changeTimeType() {
    let timeType = this.data.timeType + 1
    timeType = timeType > 3 ? 1 : timeType
    this.setData({
      timeType,
      chartData: {},
      chartReady: false
    })
    this.getChartData()
  },
  ballClickStart() {
    this.setData({
      ballOpacity: 1,
      scrollable: false //点了悬浮球后禁止下层scroll-view滑动
    })
  },
  ballClickEnd() {
    this.setData({
      ballOpacity: 0.7,
      scrollable: true
    })
  },
  ballMoveEvent(e) {
    var touchs = e.touches[0];
    var pageX = touchs.pageX;
    var pageY = touchs.pageY;
    if (pageX < 25) return;
    if (pageX > this.data.screenWidth - 25) return;
    if (this.data.screenHeight - pageY <= 25) return;
    if (pageY <= 25) return;
    var x = this.data.screenWidth - pageX - 25;
    var y = this.data.screenHeight - pageY - 25;
    this.setData({
      ballBottom: y,
      ballRight: x
    });
  },
  slideUp() { //侧栏展开
    var animation = wx.createAnimation()
    animation.translateX(0).step()
    this.setData({
      showShadow: 'block',
      showCanvas: 'none',
      scrollable: false,
      animationData: animation.export(),
    })
  },
  slideDown() {//侧栏关闭
    var animation = wx.createAnimation()
    animation.translateX('-100%').step()
    this.setData({
      showShadow: 'none',
      showCanvas: 'block',
      scrollable: true,
      animationData: animation.export(),
    })
  },
  changeMenuItem(e) {
    console.log(e)
    this.setData({
      currentMenuItem: e.currentTarget.dataset.id
    })
  },
  clickSetting(){
    this.slideDown()
    wx.navigateTo({
      url: '../setting/setting',
    })
  },
})
