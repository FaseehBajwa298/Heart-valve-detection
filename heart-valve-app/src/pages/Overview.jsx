import React from 'react';

const Overview = () => {
  return (
    <div className="pt-24 pb-12 px-4 md:px-12 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-[#1a2e35] mb-6">Heart Valve Disorder Overview</h1>
      <div className="w-20 h-1 bg-blue-500 mb-12"></div>
      
      {/* Introduction to Heart */}
      <section className="mb-16">
        <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-4">
            The heart is a muscular organ that pumps blood throughout your body. It consists of four chambers: 
            two upper chambers (atria) and two lower chambers (ventricles). Blood flow through these chambers is controlled by four valves:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li><strong>Tricuspid Valve:</strong> Located between the right atrium and the right ventricle.</li>
            <li><strong>Pulmonary Valve:</strong> Located between the right ventricle and the pulmonary artery.</li>
            <li><strong>Mitral Valve:</strong> Located between the left atrium and the left ventricle.</li>
            <li><strong>Aortic Valve:</strong> Located between the left ventricle and the aorta.</li>
          </ul>
          <p className="text-gray-600 leading-relaxed text-lg mt-4">
            These valves open and close in a precise sequence to ensure blood flows in only one direction—preventing backward flow (regurgitation) and ensuring efficient circulation.
          </p>
        </div>
      </section>

      {/* Structural Heart Disease Intro */}
      <section className="mb-16">
        <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-indigo-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">What is Structural Heart Disease?</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-4">
            Structural heart disease refers to defects or abnormalities in the heart's structure—specifically the valves, walls, or chambers.
            When a valve becomes abnormal, it usually causes one of two problems:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li><strong>Stenosis</strong> → the valve becomes narrow and restricts blood flow</li>
            <li><strong>Regurgitation</strong> → the valve does not close properly and allows blood to leak backward</li>
          </ul>
        </div>
      </section>

      {/* Stenosis Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-4 h-8 bg-red-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">STENOSIS (Valve Narrowing)</h2>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-8 border border-red-100 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-red-700 mb-4">1. Aortic Stenosis</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">What is it?</h4>
              <p className="text-gray-600 mb-4">
                Aortic stenosis occurs when the <strong>aortic valve becomes narrowed</strong>, making it difficult for blood to flow from the left ventricle into the aorta.
              </p>
              
              <h4 className="font-semibold text-gray-800 mb-2">How does it occur?</h4>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Age-related valve degeneration</li>
                <li>Calcium buildup on the valve</li>
                <li>Congenital valve abnormalities</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Common symptoms:</h4>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>Chest pain</li>
                <li>Shortness of breath</li>
                <li>Fatigue</li>
                <li>Dizziness or fainting</li>
              </ul>
              
              <h4 className="font-semibold text-gray-800 mb-2">Why is it serious?</h4>
              <p className="text-gray-600">
                The heart must work harder to pump blood, which can eventually lead to <strong>heart failure</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Regurgitation Section */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-4 h-8 bg-blue-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">REGURGITATION (Valve Leakage)</h2>
        </div>
        
        <div className="space-y-8">
          {/* Aortic Regurgitation */}
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-100 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-blue-700 mb-4">2. Aortic Regurgitation</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">What is it?</h4>
                <p className="text-gray-600 mb-4">The aortic valve does not close properly, causing blood to <strong>flow back into the left ventricle</strong>.</p>
                <h4 className="font-semibold text-gray-800 mb-2">How does it occur?</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Valve damage or degeneration</li>
                  <li>Infections affecting the valve</li>
                  <li>Long-standing high blood pressure</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Common symptoms:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Fatigue</li>
                  <li>Palpitations</li>
                  <li>Shortness of breath</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mitral Regurgitation */}
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-100 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-blue-700 mb-4">3. Mitral Regurgitation</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">What is it?</h4>
                <p className="text-gray-600 mb-4">Blood leaks backward from the left ventricle into the <strong>left atrium</strong> due to improper closure of the mitral valve.</p>
                <h4 className="font-semibold text-gray-800 mb-2">How does it occur?</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Mitral valve prolapse</li>
                  <li>Heart muscle damage after a heart attack</li>
                  <li>Rheumatic heart disease</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Common symptoms:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Breathlessness</li>
                  <li>Tiredness</li>
                  <li>Irregular or fast heartbeat</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tricuspid Regurgitation */}
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-100 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-blue-700 mb-4">4. Tricuspid Regurgitation</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">What is it?</h4>
                <p className="text-gray-600 mb-4">The tricuspid valve on the right side of the heart leaks, allowing blood to flow backward into the <strong>right atrium</strong>.</p>
                <h4 className="font-semibold text-gray-800 mb-2">How does it occur?</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Pulmonary hypertension</li>
                  <li>Enlargement of the right ventricle</li>
                  <li>Chronic lung disease</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Common symptoms:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Swelling in the legs or abdomen</li>
                  <li>Fatigue</li>
                  <li>Liver congestion</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pulmonary Regurgitation */}
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-100 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-blue-700 mb-4">5. Pulmonary Regurgitation</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">What is it?</h4>
                <p className="text-gray-600 mb-4">The pulmonary valve fails to close completely, allowing blood to flow back into the <strong>right ventricle</strong> from the pulmonary artery.</p>
                <h4 className="font-semibold text-gray-800 mb-2">How does it occur?</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>High pulmonary artery pressure</li>
                  <li>Valve damage</li>
                  <li>Congenital heart disease</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Common symptoms:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Reduced exercise tolerance</li>
                  <li>Shortness of breath</li>
                  <li>Fatigue</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Structural Heart Conditions */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-4 h-8 bg-yellow-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Other Structural Heart Conditions (Non-Valve)</h2>
        </div>
        <p className="text-gray-600 mb-8">These conditions are not directly related to valve narrowing or leakage but still indicate <strong>structural heart disease</strong>.</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
            <h3 className="font-bold text-yellow-800 mb-2">Reduced Pumping Function (Low Ejection Fraction)</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>The heart cannot pump blood efficiently</li>
              <li>Leads to fatigue and breathlessness</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
            <h3 className="font-bold text-yellow-800 mb-2">Thickened Heart Walls (Left Ventricular Hypertrophy)</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Heart walls become stiff and thick</li>
              <li>Usually caused by long-term high blood pressure</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
            <h3 className="font-bold text-yellow-800 mb-2">Pulmonary Hypertension</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Increased pressure in the pulmonary arteries</li>
              <li>Causes strain on the right side of the heart</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
            <h3 className="font-bold text-yellow-800 mb-2">Pericardial Effusion</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Accumulation of fluid around the heart</li>
              <li>Can restrict normal heart movement in severe cases</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
            <h3 className="font-bold text-yellow-800 mb-2">Right Ventricular Systolic Dysfunction</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>The right ventricle is weak and cannot pump blood efficiently</li>
              <li>Leads to fluid buildup and swelling</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
            <h3 className="font-bold text-yellow-800 mb-2">Elevated Pulmonary Pressures (High TR Velocity)</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>High speed of blood leaking back through the tricuspid valve</li>
              <li>A sign of high pressure in the lungs (Pulmonary Hypertension)</li>
            </ul>
          </div>
        </div>
      </section>



      {/* Footer Note */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>This information is for educational purposes only and should not be considered medical advice.</p>
      </div>
    </div>
  );
};

export default Overview;
