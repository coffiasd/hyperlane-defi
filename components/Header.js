import {
    useConnectModal,
    useAccountModal,
    useChainModal,
} from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi'
import { FaTwitter, FaGithub, FaYoutube } from "react-icons/fa";
import styles from '../styles/Home.module.css';
import Image from 'next/image'

export default function Header() {
    const { openConnectModal } = useConnectModal();
    const { openAccountModal } = useAccountModal();
    const { openChainModal } = useChainModal();

    const { address, isConnected } = useAccount();

    return (
        <div className="navbar text-neutral-content border-solid border-b-2 bg-base-content">
            <div className="flex-1 ml-3">
                <ul className='flex flex-row justify-between gap-6'>
                    <li><a className={styles.logo} href="#"><Image src="/hyperlane-logo-2.svg" width={80} height={20} /></a></li>
                    <li><a className={styles.leftToRight} href="https://twitter.com/coffiasd"><FaTwitter size="1.2rem" className='m-0.5' />TWITTER</a></li>
                    <li><a className={styles.leftToRight} href="https://github.com/coffiasd"><FaGithub size="1.2rem" className='m-0.5' />GITHUB</a></li>
                    <li><a className={styles.leftToRight} href="#"><FaYoutube size="1.3rem" className='m-0.5' />YOUTUBE</a></li>
                </ul>
            </div>

            <div className="navbar-end">
                {isConnected ?
                    (<><button className="btn btn-sm btn-primary ml-3 normal-case" onClick={openAccountModal}>Profile</button><button className="btn btn-sm btn-info ml-3 normal-case " onClick={openChainModal}>Chain</button></>)
                    :
                    (<button className="btn btn-sm btn-warning ml-3 normal-case" onClick={openConnectModal}>connect wallet</button>)
                }
            </div>
        </div >
    )
}