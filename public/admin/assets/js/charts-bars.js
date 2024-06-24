/**
 * For usage, visit Chart.js docs https://www.chartjs.org/docs/latest/
 */
let countbar = [0,...counts]
const barConfig = {
  type: 'bar',
  data: {
    labels: ["",...months,],
    datasets: [
      {
        label: 'Sales',
        backgroundColor: '#0694a2',
        // borderColor: window.chartColors.red,
        borderWidth: 1,
        data: countbar,
      },
      
    ],
  },
  options: {
    responsive: true,
    legend: {
      display: false,
    },
  },
}

const barsCtx = document.getElementById('bars')
window.myBar = new Chart(barsCtx, barConfig)
