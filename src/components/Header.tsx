import styles from "./Header.module.css";

interface HeaderProps{
    title:string;
}

export default function Header({title}:HeaderProps){
    return(
        <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
        </header>
    );
}