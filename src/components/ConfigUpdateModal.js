import Modal from 'react-modal'
import { useDispatch } from 'react-redux'
import defaultConfig from '../config.json'
import { LATEST_CONFIG_VERSION } from '../configVersion'
import { setCourses, setDegrees } from '../store/index'
import { setMajors, setMinors } from '../store/slices/programsSlice'

function ConfigUpdateModal({ isModalOpen, setIsModalOpen }) {
  function closeModal() {
    setIsModalOpen(false)
  }

  const dispatch = useDispatch()
  function updateConfig() {
    localStorage.setItem('configVersion', '2024.06')
    dispatch(setCourses(defaultConfig.courses))
    dispatch(setDegrees(defaultConfig.degrees))
    dispatch(setMajors(defaultConfig.majors))
    dispatch(setMinors(defaultConfig.minors))
    window.location.reload()
  }

  return (
    <div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            borderRadius: 0,
            height: 'fit-content',
            maxWidth: '70rem',
            margin: 'auto',
            padding: '2rem',
          },
          overlay: {
            zIndex: 100,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            overflow: 'scroll',
          },
        }}
        contentLabel="Config Update Available">
        <div className="flex w-full flex-col items-center justify-center space-y-5 text-center">
          <div className="bg-accent px-2 py-1 text-3xl font-bold text-white max-sm:text-xl">
            <u>
              <i>Course Planner</i>
            </u>{' '}
            📚🗓️
          </div>
          <div className="font-mono text-xl">
            {LATEST_CONFIG_VERSION} Update Available!
          </div>
          <div>
            A new version of the config has been released, including support for
            additional degrees.
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={updateConfig}
              className="w-40 border-2 border-accent p-0.5 text-accent hover:bg-accent hover:text-white">
              UPDATE NOW
            </button>
            <button
              onClick={closeModal}
              className="opacity-50 hover:opacity-100">
              Dismiss
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ConfigUpdateModal
