import styles from './Home.module.css'

export function Home() {
  return (
    <div className={styles.placeholder}>
      <p>Выберите чат, чтобы открыть переписку</p>
      <p className={styles.hint}>или создайте новый кнопкой «+»</p>
    </div>
  )
}

export default Home
