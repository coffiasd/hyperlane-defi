import Head from 'next/head'
import Footer from '../components/Footer';
import dynamic from 'next/dynamic';
import React from "react";
import { Alert } from '../components/alert.jsx';
// import { Swap } from '../components/Swap';

const Header = dynamic(() => import('../components/Header'), {
  ssr: false,
})

const Swap = dynamic(() => import('../components/Swap'), {
  ssr: false,
})

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-200" data-theme="coffee">
      <Head>
        <title>Hyperlane Based Swap</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <Alert />

      <div className='min-h-screen'>
        <Swap />
      </div>
      <Footer />
    </div >
  )
}
