import Link from "next/link";

export default function Footer({ className = "" }) {
    const currentYear = new Date().getFullYear();
    return (
        <footer className={`flex items-center justify-center ${className}`}>
             <div className="flex flex-col text-xs space-y-2 font-[200] md:flex-row md:space-x-6 md:text-center md:items-center md:justify-center md:text-lg">
          <Link
            href="mailto:contact@smalltech.in"
            className="flex items-center hover:underline space-x-2"
          >
            <span className="text-expresso">✉ mail</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <span className="text-expresso">© {currentYear} madhyamakist pvt ltd</span>
          </div>
        </div>

        </footer>
    );
}
