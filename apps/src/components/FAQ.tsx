import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onClick: () => void }> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group hover:bg-white/[0.02] transition-colors px-4"
      >
        <span className={`text-lg md:text-xl font-oswald tracking-wide uppercase transition-colors ${isOpen ? 'text-brand-stellar' : 'text-gray-300 group-hover:text-white'}`}>
          {question}
        </span>
        <div className={`w-8 h-8 flex items-center justify-center border border-white/10 transition-all duration-300 ${isOpen ? 'bg-brand-stellar border-brand-stellar text-black' : 'text-gray-400 group-hover:border-white'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pb-8 px-4 text-gray-400 leading-relaxed font-light max-w-3xl">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does the Dark Pool ensure privacy?",
      answer: "Duskpool utilizes Protocol 25's Zero-Knowledge Proof capabilities. When you place an order, only a cryptographic commitment is broadcasted. The details of the trade (asset, amount, direction) remain hidden until settlement, ensuring no information leakage to the market."
    },
    {
      question: "Is KYC required to trade?",
      answer: "Yes. Duskpool is a permissioned environment for institutional grade assets. Users must prove their inclusion in a KYC whitelist via a Merkle Tree proof. This proof allows you to trade without revealing your specific identity on-chain."
    },
    {
      question: "What assets are supported?",
      answer: "We currently support tokenized US Treasury Bills, PAXG (Gold), and select Commercial Real Estate tokens. All assets are issued by regulated partners on the Stellar network."
    },
    {
      question: "How does settlement work?",
      answer: "Settlement is atomic. Once the ZK-verifier contract confirms the validity of two matching orders, the swap happens instantly in a single transaction. This eliminates counterparty risk."
    },
    {
      question: "What is the fee structure?",
      answer: "Fees are determined by the governance DAO. Currently, there is a 0.05% taker fee which flows into the insurance fund and treasury. Makers enjoy 0% fees to encourage liquidity."
    }
  ];

  return (
    <div className="w-full min-h-screen relative px-6 md:px-12 py-20 flex flex-col items-center">

       <div className="w-full max-w-4xl relative z-10">

          {/* Header */}
          <div className="mb-16 border-l-2 border-brand-stellar pl-6">
             <h1 className="text-4xl md:text-6xl font-condensed font-bold text-white uppercase tracking-tight mb-2">
                Frequently Asked <br /> Questions
             </h1>
             <p className="text-gray-400 uppercase tracking-widest text-xs">
                Learn more about the technology
             </p>
          </div>

          {/* FAQ List */}
          <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 overflow-hidden shadow-2xl">
             {faqs.map((faq, index) => (
               <FAQItem
                 key={index}
                 question={faq.question}
                 answer={faq.answer}
                 isOpen={openIndex === index}
                 onClick={() => setOpenIndex(openIndex === index ? null : index)}
               />
             ))}
          </div>

       </div>
    </div>
  );
};

export default FAQ;
