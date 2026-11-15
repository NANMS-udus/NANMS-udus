import { useContext, useEffect, useState } from 'react';
import './AlumniGrid.css';
import PaginationSection from './PaginationSection';
import { GenContext } from '../../MyContexts/GenContexts';
import AlumniCard from './AlumniCard';
import UtilsSection from './UtilsSection';
import useArrayByPage from '../../Utils/useArrayByPage';
import alumni from '../../Utils/AlumniData';

export default function AlumniGrid() {

  const { alumni: alumOnline } = useContext(GenContext)

  const [pageNo, setPageNo] = useState(1)

  const allAlumni = [ ...alumni, ...alumOnline ]

  const [displayed, setDisplayed] = useState(allAlumni)

  useEffect(() => {
    function updateDisplayed() {
      setDisplayed(allAlumni)
    }

    updateDisplayed()
  }, [alumni, alumOnline])

  const [alumniByPage] = useArrayByPage(displayed, 6, [])

  return (
    <section class="section-block">
      <div class="section-header">
        <h2 class="section-title">Notable Alumni Network</h2>
        <p class="section-desc">Our graduates making ground-breaking contributions in clinical medicine, surgical
          specialties, and public health worldwide.</p>
      </div>
      <div class="alumni-intro">
        <div class="alumni-intro-text">
          <h3>A Far Reaching Network of Doctors &amp; Physicians Across the country</h3>
          <p>From university teaching hospitals in Nigeria to world-renowned research institutes across the UK, North
            America, and beyond, NANMS alumni remain steadfast in advancing healthcare standards and supporting current
            student cohorts.</p>
        </div>
        <div class="alumni-stats">
          <div class="stat-item">
            <span class="stat-num">850+</span>
            <span class="stat-label">Doctors Graduated</span>
          </div>
        </div>
      </div>
      <UtilsSection target={displayed} 
      setterFun={setDisplayed} 
      filterParams={['class', 'specialty']}
      def={allAlumni}
      />
      {
        allAlumni.length
          ? <div class="alumni-grid">
            {
              alumniByPage[pageNo - 1]?.map((a) => {

                return <AlumniCard details={a} />
              })

            }
          </div>
          : <h2 style={{ textAlign: 'center', color: 'grey' }}>
            No Alumnus found.
          </h2>
      }
      <PaginationSection
        target={alumniByPage}
        pageNo={pageNo}
        setPageNo={setPageNo}
        displayTitle={'alumni'}
      />
    </section>
  );
};