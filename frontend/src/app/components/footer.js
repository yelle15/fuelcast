export default function Footer() {
    return (
        <footer className="w-full bg-sky-950 px-8 py-6">
            <div className="mx-auto max-w-8xl grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-teal-400">ABOUT FUELCAST SEA</p>
                    <p className="max-w-sm text-xs font-medium text-white">
                        FuelCast SEA is a machine learning powered system designed to help drivers forecast fuel price movements in Southeast Asia.
                        Make informed decisions and plan your trips with confidence.
                    </p>
                </div>

                <div className="space-y-3 md:text-right">
                    <p className="text-xs font-semibold text-white">A 4-328 CS 3246 - CS Elective 1 (Machine Learning) Final Project</p>
                    <p className="text-xs font-medium text-white">by Benjamin Asjali, Arielle Aventura, Dreame Baculio, and Sam Tesoro</p>
                    <p className="text-[10px] font-medium text-slate-200">2024 FuelCast SEA. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}