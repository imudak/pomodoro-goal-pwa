import { loadHistory, getTodayPomodoros } from '../storage'
import './Stats.css'

export default function Stats() {
  const history = loadHistory()
  const todayPomos = getTodayPomodoros()

  const last7 = history.slice(-7)
  const last30 = history.slice(-30)

  const sum = (records: typeof history) => ({
    pomos: records.reduce((a, r) => a + r.totalPomodoros, 0),
    mins: records.reduce((a, r) => a + r.totalMinutes, 0),
    goals: records.reduce((a, r) => a + r.goalsCompleted, 0),
  })

  const week = sum(last7)
  const month = sum(last30)

  const maxPomos = Math.max(...last7.map(r => r.totalPomodoros), todayPomos, 1)

  return (
    <div className="stats">
      <div className="stats-card">
        <h3>今日</h3>
        <div className="stats-big">{todayPomos} <span className="stats-unit">ポモドーロ</span></div>
        <div className="stats-sub">{todayPomos * 25}分の集中</div>
      </div>

      <div className="stats-card">
        <h3>直近7日間</h3>
        <div className="stats-chart">
          {last7.map(r => (
            <div key={r.date} className="chart-bar-wrapper">
              <div
                className="chart-bar"
                style={{ height: `${(r.totalPomodoros / maxPomos) * 100}%` }}
              />
              <span className="chart-label">{r.date.slice(8)}</span>
            </div>
          ))}
        </div>
        <div className="stats-row">
          <span>🍅 {week.pomos}回</span>
          <span>⏱ {week.mins}分</span>
          <span>🎯 {week.goals}達成</span>
        </div>
      </div>

      <div className="stats-card">
        <h3>直近30日間</h3>
        <div className="stats-row">
          <span>🍅 {month.pomos}回</span>
          <span>⏱ {Math.round(month.mins / 60)}時間</span>
          <span>🎯 {month.goals}達成</span>
        </div>
      </div>

      {history.length === 0 && (
        <p className="stats-empty">データがまだありません。<br />ポモドーロを完了すると統計が表示されます。</p>
      )}
    </div>
  )
}
